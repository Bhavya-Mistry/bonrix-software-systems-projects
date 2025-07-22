from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional
import json
import time

from utils.database import get_db
from utils.auth import get_current_user
from models.database import User, TaskLog
from services.llm_service import get_llm_service
from services.credit_service import deduct_credits, estimate_token_usage

router = APIRouter(
    prefix="/api/resume-analysis",
    tags=["Resume Analysis"]
)

@router.post("/analyze")
async def analyze_resume(
    resume_file: UploadFile = File(...),
    job_profile: str = Form(...),
    model: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Job profile descriptions - these would be used to generate appropriate prompts for the LLM
    job_profiles = {
        'Full Stack Developer': 'A developer who works with both frontend and backend technologies. Skills include JavaScript, HTML/CSS, and backend languages like Python, Node.js, etc.',
        'Backend Developer (Node.js, Django, etc.)': 'A developer focused on server-side logic, databases, and application architecture. Skills include Node.js, Django, Flask, Express, databases, and API design.',
        'Frontend Developer (React, Angular, Vue.js)': 'A developer specialized in creating user interfaces and experiences. Skills include React, Angular, Vue.js, HTML, CSS, JavaScript, and responsive design.',
        'Mobile App Developer (iOS/Android/Flutter)': 'A developer who creates applications for mobile devices. Skills include Swift, Kotlin, Java, Flutter, React Native, and mobile UX design.',
        'DevOps Engineer': 'An engineer who combines development and operations. Skills include CI/CD, containerization, cloud platforms, infrastructure as code, and automation.',
        'Data Scientist': 'A professional who analyzes and interprets complex data. Skills include Python, R, statistics, machine learning, data visualization, and SQL.',
        'Machine Learning Engineer': 'An engineer who develops AI systems that can learn and improve. Skills include Python, TensorFlow, PyTorch, deep learning, and MLOps.',
        'Data Analyst': 'A professional who interprets data to inform business decisions. Skills include SQL, Excel, data visualization tools, and statistical analysis.',
        'AI Research Engineer': 'A researcher who advances the field of artificial intelligence. Skills include machine learning, deep learning, natural language processing, and academic research.',
        'Prompt Engineer (LLM / NLP)': 'A specialist who designs prompts for large language models. Skills include NLP, understanding of LLMs, and creative problem-solving.',
        'Cloud Solutions Architect (AWS/GCP/Azure)': 'An architect who designs and implements cloud solutions. Skills include AWS/GCP/Azure services, networking, security, and scalable architecture design.',
        'System Administrator': 'A professional who maintains computer systems and networks. Skills include Linux/Windows administration, networking, security, and troubleshooting.',
        'Site Reliability Engineer (SRE)': 'An engineer who applies software engineering to operations problems. Skills include programming, automation, monitoring, and incident response.',
        'Cybersecurity Analyst': 'A security professional who protects systems from threats. Skills include security tools, threat analysis, vulnerability assessment, and security protocols.',
        'Product Manager (Tech)': 'A manager who guides product development from conception to launch. Skills include market research, roadmapping, agile methodologies, and technical understanding.',
        'UI/UX Designer': 'A designer who creates user interfaces and experiences. Skills include design tools, wireframing, prototyping, and user research.',
        'Technical Program Manager': 'A manager who coordinates technical projects across teams. Skills include project management, technical knowledge, stakeholder management, and risk assessment.',
        'QA/Test Automation Engineer': 'An engineer who ensures software quality through testing. Skills include test automation, manual testing, QA methodologies, and bug tracking.',
        'Embedded Engineer': 'An engineer who develops software for embedded systems. Skills include C/C++, microcontroller programming, real-time operating systems, and hardware interfaces.',
        'Business Analyst': 'An analyst who bridges the gap between business and IT. Skills include requirements gathering, process modeling, data analysis, and stakeholder communication.',
        'Operations Manager': 'A manager who oversees daily business operations. Skills include process optimization, team management, resource allocation, and operational analytics.',
        'Product Manager (Non-Tech)': 'A manager who guides product development in non-technical fields. Skills include market research, customer insights, product strategy, and cross-functional collaboration.',
        'Strategy Consultant': 'A consultant who advises on business strategy. Skills include market analysis, competitive intelligence, strategic planning, and business modeling.',
        'Project Coordinator': 'A professional who assists with project management tasks. Skills include scheduling, documentation, communication, and basic project management tools.',
        'Digital Marketing Specialist': 'A marketer who implements digital marketing strategies. Skills include SEO/SEM, social media, content marketing, and analytics tools.',
        'Sales Executive / Manager': 'A professional who drives sales and manages client relationships. Skills include sales techniques, CRM systems, negotiation, and market knowledge.',
        'Content Strategist': 'A strategist who plans content creation and distribution. Skills include content planning, audience research, editorial calendars, and content analytics.',
        'SEO Analyst': 'An analyst who optimizes websites for search engines. Skills include keyword research, on-page SEO, technical SEO, and SEO analytics tools.',
        'Customer Success Manager': 'A manager who ensures customer satisfaction and retention. Skills include relationship management, product knowledge, customer onboarding, and success metrics.',
        'Accountant / Chartered Accountant (CA)': 'A professional who manages financial records and reporting. Skills include accounting principles, financial software, tax regulations, and financial analysis.',
        'Financial Analyst': 'An analyst who assesses financial performance and projections. Skills include financial modeling, valuation, Excel, and financial statement analysis.',
        'Human Resources (HR) Executive': 'An executive who manages HR functions. Skills include recruitment, employee relations, HR policies, and HR information systems.',
        'Payroll Specialist': 'A specialist who manages employee compensation. Skills include payroll systems, tax regulations, benefits administration, and compliance.',
        'Recruiter / Talent Acquisition Specialist': 'A professional who sources and hires talent. Skills include sourcing techniques, interviewing, ATS systems, and employer branding.',
        'Graphic Designer': 'A designer who creates visual content. Skills include design software, typography, color theory, and visual communication.',
        'Social Media Manager': 'A manager who oversees social media presence. Skills include platform knowledge, content creation, community management, and social analytics.',
        'Video Editor / Animator': 'A creative professional who edits video or creates animations. Skills include video editing software, animation tools, storytelling, and visual effects.',
        'Copywriter / Content Writer': 'A writer who creates marketing and informational content. Skills include writing, editing, SEO knowledge, and adapting tone for different audiences.',
        'Public Relations (PR) Executive': 'An executive who manages public image and media relations. Skills include media relations, crisis management, communication strategy, and brand positioning.'
    }
    
    # Get the job description from the selected profile
    job_description = job_profiles.get(job_profile, 'A professional role requiring relevant skills and experience.')
    # Check if user has enough credits
    # Using a fixed token estimation for job profiles since they're predefined
    estimated_tokens = estimate_token_usage("resume_analysis", 500)  # Average length of job descriptions
    estimated_cost = estimated_tokens * 0.001  # Example: 1 credit per 1000 tokens
    
    if current_user.credits < estimated_cost:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits"
        )
    
    # Read the resume file
    resume_content = await resume_file.read()
    
    try:
        # Get the appropriate LLM service
        llm_service = get_llm_service(model)
        
        # Start timing
        start_time = time.time()
        
        # Process the resume with the job description from the selected profile
        result = llm_service.analyze_resume(resume_content, job_description)
        
        # Add the selected job profile to the result for reference
        result['job_profile'] = job_profile
        
        # Calculate time taken
        time_taken = time.time() - start_time
        
        # Calculate actual token usage and cost
        tokens_used = result.get("tokens_used", estimated_tokens)
        credit_cost = tokens_used * 0.001  # Same rate as estimation
        
        # Deduct credits - check if successful
        if not deduct_credits(db, current_user.id, credit_cost):
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits. This task requires {credit_cost:.2f} credits but you only have {current_user.credits:.2f} credits available."
            )
        
        # Log the task
        task_log = TaskLog(
            user_id=current_user.id,
            task_type="resume_analysis",
            model_used=model,
            tokens_used=tokens_used,
            credit_cost=credit_cost,
            result_json=result
        )
        
        db.add(task_log)
        db.commit()
        
        # Format the response
        response = {
            "task": "Resume Analysis",
            "model": model,
            "job_profile": job_profile,
            "estimated_tokens": estimated_tokens,
            "credits_used": credit_cost,
            "time_taken_sec": time_taken,
            "result": {
                "summary": result.get("summary", ""),
                "structured_data": {
                    "fit_score": result.get("fit_score", 0),
                    "strengths": result.get("strengths", []),
                    "red_flags": result.get("red_flags", []),
                    "final_verdict": result.get("final_verdict", "")
                }
            }
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )
