// Default job profiles for all users
export const DEFAULT_JOB_PROFILES = [
    'Full Stack Developer',
    'Backend Developer (Node.js, Django, etc.)',
    'Frontend Developer (React, Angular, Vue.js)',
    'Mobile App Developer (iOS/Android/Flutter)'
  ];
  
  // Utility to get profiles from localStorage (simulate user-specific storage)
  export function getUserJobProfiles() {
    let profiles = [];
    try {
      const stored = localStorage.getItem('user_job_profiles');
      if (stored) profiles = JSON.parse(stored);
    } catch (e) { profiles = []; }
    return profiles;
  }
  
  export function saveUserJobProfiles(profiles) {
    localStorage.setItem('user_job_profiles', JSON.stringify(profiles));
  }
  