--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0
-- Dumped by pg_dump version 16.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- Name: credit_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.credit_packages (
    id integer NOT NULL,
    name character varying NOT NULL,
    credits double precision NOT NULL,
    price_inr double precision NOT NULL,
    price_usd double precision NOT NULL,
    is_active integer,
    is_promotional integer,
    discount_percentage double precision,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.credit_packages OWNER TO postgres;

--
-- Name: credit_packages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.credit_packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.credit_packages_id_seq OWNER TO postgres;

--
-- Name: credit_packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.credit_packages_id_seq OWNED BY public.credit_packages.id;


--
-- Name: model_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_configs (
    id integer NOT NULL,
    model_name character varying NOT NULL,
    is_active integer,
    token_cost_multiplier double precision,
    description character varying,
    provider character varying NOT NULL,
    updated_at timestamp without time zone
);


ALTER TABLE public.model_configs OWNER TO postgres;

--
-- Name: model_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.model_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.model_configs_id_seq OWNER TO postgres;

--
-- Name: model_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.model_configs_id_seq OWNED BY public.model_configs.id;


--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_settings (
    id integer NOT NULL,
    key character varying NOT NULL,
    value text,
    description character varying,
    is_secure integer,
    updated_at timestamp without time zone,
    updated_by integer
);


ALTER TABLE public.platform_settings OWNER TO postgres;

--
-- Name: platform_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platform_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_settings_id_seq OWNER TO postgres;

--
-- Name: platform_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platform_settings_id_seq OWNED BY public.platform_settings.id;


--
-- Name: statement_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statement_history (
    id integer NOT NULL,
    user_id integer NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    credit double precision,
    debit double precision,
    purchase_amount double precision,
    opening_balance double precision NOT NULL,
    closing_balance double precision NOT NULL,
    transaction_type character varying NOT NULL,
    description character varying,
    reference_id integer,
    "timestamp" timestamp without time zone
);


ALTER TABLE public.statement_history OWNER TO postgres;

--
-- Name: statement_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.statement_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.statement_history_id_seq OWNER TO postgres;

--
-- Name: statement_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.statement_history_id_seq OWNED BY public.statement_history.id;


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    log_type character varying NOT NULL,
    source character varying NOT NULL,
    message text NOT NULL,
    details json,
    user_id integer,
    "timestamp" timestamp without time zone
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_logs_id_seq OWNER TO postgres;

--
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- Name: task_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    task_type character varying NOT NULL,
    model_used character varying NOT NULL,
    tokens_used integer NOT NULL,
    credit_cost double precision NOT NULL,
    result_json json,
    "timestamp" timestamp without time zone
);


ALTER TABLE public.task_logs OWNER TO postgres;

--
-- Name: task_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_logs_id_seq OWNER TO postgres;

--
-- Name: task_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_logs_id_seq OWNED BY public.task_logs.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    amount double precision NOT NULL,
    method character varying NOT NULL,
    payment_id character varying,
    status character varying,
    "timestamp" timestamp without time zone
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    credits double precision,
    created_at timestamp without time zone,
    is_admin integer DEFAULT 0
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: credit_packages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_packages ALTER COLUMN id SET DEFAULT nextval('public.credit_packages_id_seq'::regclass);


--
-- Name: model_configs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_configs ALTER COLUMN id SET DEFAULT nextval('public.model_configs_id_seq'::regclass);


--
-- Name: platform_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings ALTER COLUMN id SET DEFAULT nextval('public.platform_settings_id_seq'::regclass);


--
-- Name: statement_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statement_history ALTER COLUMN id SET DEFAULT nextval('public.statement_history_id_seq'::regclass);


--
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- Name: task_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_logs ALTER COLUMN id SET DEFAULT nextval('public.task_logs_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
001
\.


--
-- Data for Name: credit_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.credit_packages (id, name, credits, price_inr, price_usd, is_active, is_promotional, discount_percentage, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: model_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_configs (id, model_name, is_active, token_cost_multiplier, description, provider, updated_at) FROM stdin;
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, key, value, description, is_secure, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: statement_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.statement_history (id, user_id, username, email, credit, debit, purchase_amount, opening_balance, closing_balance, transaction_type, description, reference_id, "timestamp") FROM stdin;
1	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	100	0	100	0	100	purchase	Credit purchase via razorpay	1	2025-05-26 11:43:24.115518
2	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	100	0	100	100	200	purchase	Credit purchase via stripe	4	2025-05-29 06:03:20.610435
3	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	100	0	100	200	300	purchase	Credit purchase via stripe	5	2025-05-29 06:03:37.084517
4	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	100	0	100	300	400	purchase	Credit purchase via stripe	6	2025-05-29 06:29:04.922546
5	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	100	0	100	400	500	purchase	Credit purchase via admin_assignment	7	2025-05-30 05:52:40.679251
6	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	100	0	100	500	600	purchase	Credit purchase via stripe	8	2025-06-02 09:16:19.389441
7	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	100	0	100	600	700	purchase	Credit purchase via stripe	9	2025-06-02 11:31:57.421809
8	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	100	0	100	700	800	purchase	Credit purchase via stripe	10	2025-06-02 11:37:56.191317
9	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	100	0	100	800	900	purchase	Credit purchase via stripe	11	2025-06-02 11:43:10.654892
10	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0	0	900	900	usage	Credits used for custom_prompt task	1	2025-05-26 10:32:44.470014
11	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0	0	900	900	usage	Credits used for custom_prompt task	2	2025-05-26 10:36:35.633897
12	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0	0	900	900	usage	Credits used for custom_prompt task	3	2025-05-26 10:54:58.854152
13	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0	0	900	900	usage	Credits used for custom_prompt task	4	2025-05-26 10:57:05.83011
14	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0	0	900	900	usage	Credits used for sentiment_analysis task	5	2025-05-26 10:57:50.494248
15	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0	0	900	900	usage	Credits used for sentiment_analysis task	6	2025-05-26 10:58:13.424587
16	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0	0	900	900	usage	Credits used for custom_prompt task	7	2025-05-26 10:58:34.774538
17	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.40700000000000003	0	900	899.593	usage	Credits used for sentiment_analysis task	8	2025-05-26 11:39:21.674136
18	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.688000000000002	0	899.593	869.905	usage	Credits used for resume_analysis task	9	2025-05-26 11:40:20.923963
19	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.606	0	869.905	869.299	usage	Credits used for custom_prompt task	10	2025-05-27 06:48:27.120787
20	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.803	0	869.299	839.496	usage	Credits used for resume_analysis task	13	2025-05-29 05:38:50.091978
21	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.698	0	839.496	809.798	usage	Credits used for resume_analysis task	14	2025-05-29 05:42:56.290783
22	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.684	0	809.798	780.114	usage	Credits used for resume_analysis task	15	2025-05-29 05:44:00.529279
23	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.773	0	780.114	750.341	usage	Credits used for resume_analysis task	16	2025-05-29 05:48:45.624684
24	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.793	0	750.341	720.548	usage	Credits used for resume_analysis task	17	2025-05-29 05:55:32.475298
25	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.743000000000002	0	720.548	690.805	usage	Credits used for resume_analysis task	18	2025-05-29 06:02:56.370154
26	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.151	0	690.805	690.654	usage	Credits used for object_detection task	19	2025-05-29 06:08:57.581383
27	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.064	0	690.654	690.59	usage	Credits used for object_detection task	20	2025-05-29 06:13:22.756266
28	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.064	0	690.59	690.5260000000001	usage	Credits used for object_detection task	21	2025-05-29 06:18:20.542302
29	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.065	0	690.5260000000001	690.461	usage	Credits used for object_detection task	22	2025-05-29 06:20:41.23353
30	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.748	0	690.461	660.713	usage	Credits used for resume_analysis task	23	2025-05-29 06:21:07.946964
31	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.271	0	660.713	660.442	usage	Credits used for text_summarization task	24	2025-05-29 06:24:08.444576
32	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.264	0	660.442	660.178	usage	Credits used for text_summarization task	25	2025-05-29 06:28:43.995824
33	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.255	0	660.178	659.923	usage	Credits used for text_summarization task	26	2025-05-29 06:32:42.238398
34	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.715	0	659.923	630.208	usage	Credits used for resume_analysis task	27	2025-05-29 06:35:10.872297
35	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.749000000000002	0	630.208	600.459	usage	Credits used for resume_analysis task	28	2025-05-29 06:39:03.137537
36	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.732	0	600.459	570.727	usage	Credits used for resume_analysis task	29	2025-05-29 06:41:33.59249
37	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.698	0	570.727	541.029	usage	Credits used for resume_analysis task	30	2025-05-29 06:46:26.113851
38	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.799	0	541.029	511.23	usage	Credits used for resume_analysis task	31	2025-05-29 06:50:25.630119
39	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.752	0	511.23	481.478	usage	Credits used for resume_analysis task	32	2025-05-29 06:51:59.143592
40	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.22	0	481.478	481.258	usage	Credits used for sentiment_analysis task	33	2025-05-29 06:54:29.282505
41	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.065	0	481.258	481.193	usage	Credits used for object_detection task	34	2025-05-29 08:22:47.112055
42	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.685000000000002	0	481.193	451.508	usage	Credits used for resume_analysis task	35	2025-05-29 08:32:21.740028
43	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.242	0	451.508	451.26599999999996	usage	Credits used for text_summarization task	36	2025-05-30 06:10:31.27324
44	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.251	0	451.26599999999996	451.015	usage	Credits used for text_summarization task	37	2025-05-30 06:13:49.406714
45	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	0.07100000000000001	0	451.015	450.94399999999996	usage	Credits used for object_detection task	38	2025-05-30 11:48:11.50174
46	5	Admin User	admin@windsurf.com	100	0	100	0	100	purchase	Credit purchase via stripe	2	2025-05-28 06:58:00.176121
47	3	Arpit Bhuva	arpit@gmail.com	100	0	100	0	100	purchase	Credit purchase via razorpay	3	2025-05-28 10:15:32.859574
48	3	Arpit Bhuva	arpit@gmail.com	0	0.374	0	100	99.626	usage	Credits used for custom_prompt task	11	2025-05-28 10:15:53.190818
49	3	Arpit Bhuva	arpit@gmail.com	0	29.626	0	99.626	70	usage	Credits used for resume_analysis task	12	2025-05-28 10:17:54.777581
50	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.791	0	580.6870000000001	550.8960000000001	usage	Credits used for usage	\N	2025-06-03 11:31:36.817522
51	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.772000000000002	0	550.8960000000001	521.124	usage	Credits used for usage	\N	2025-06-03 11:35:41.367458
52	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.814	0	521.124	491.31	usage	Credits used for usage	\N	2025-06-03 11:35:58.179675
53	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.682000000000002	0	491.31	461.628	usage	Credits used for usage	\N	2025-06-03 11:38:27.597541
54	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	29.694	0	461.628	431.93399999999997	usage	Credits used for usage	\N	2025-06-06 12:53:07.316802
55	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	1	0	431.93399999999997	430.93399999999997	usage	Credits used for usage	\N	2025-06-24 15:01:59.843116
56	1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	0	1	0	430.93399999999997	429.93399999999997	usage	Credits used for usage	\N	2025-06-24 15:04:52.168036
\.


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_logs (id, log_type, source, message, details, user_id, "timestamp") FROM stdin;
1	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-28T09:12:37.916098"}	6	2025-05-28 09:12:37.91729
2	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-28T09:22:03.740810"}	6	2025-05-28 09:22:03.742387
3	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-28T09:25:56.782658"}	6	2025-05-28 09:25:56.783708
4	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-28T09:31:44.358156"}	6	2025-05-28 09:31:44.360149
5	admin	user_management	Admin admin@windsurf.ai created new user bonrix@gmail.com	{"admin_id": 6, "user_id": 7, "user_email": "bonrix@gmail.com", "is_admin": false}	6	2025-05-28 09:32:17.173904
6	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-28T09:36:16.214329"}	6	2025-05-28 09:36:16.214329
7	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-28T09:38:06.617563"}	6	2025-05-28 09:38:06.619071
8	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-28T10:18:49.196692"}	6	2025-05-28 10:18:49.198244
9	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-28T10:19:43.222144"}	6	2025-05-28 10:19:43.223305
10	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-28T10:20:06.615976"}	6	2025-05-28 10:20:06.615976
11	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-29T05:09:01.120369"}	6	2025-05-29 05:09:01.122407
12	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-29T08:33:47.894867"}	6	2025-05-29 08:33:47.896905
13	security	admin_login	Failed admin login attempt for user harshdeepsinh7711@gmail.com from IP 127.0.0.1	{"ip_address": "127.0.0.1", "timestamp": "2025-05-29T08:37:04.223106"}	\N	2025-05-29 08:37:04.224138
14	security	admin_login	Failed admin login attempt for user harshdeepsinh7711@gmail.com from IP 127.0.0.1	{"ip_address": "127.0.0.1", "timestamp": "2025-05-29T08:37:08.972872"}	\N	2025-05-29 08:37:08.972872
15	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-30T05:23:10.831413"}	6	2025-05-30 05:23:10.832978
16	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-30T05:36:47.322417"}	6	2025-05-30 05:36:47.324485
17	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-30T05:45:23.748323"}	6	2025-05-30 05:45:23.74932
18	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-30T05:52:00.188050"}	6	2025-05-30 05:52:00.189589
19	info	admin	Admin Admin User assigned 100.0 credits to user harshdeepsinh7711@gmail.com	"{\\"admin_id\\": 6, \\"user_id\\": 1, \\"previous_credits\\": 81.25100000000008, \\"assigned_amount\\": 100.0, \\"new_credits\\": 181.2510000000001}"	1	2025-05-30 05:52:40.678114
20	security	admin_login	Failed admin login attempt for user harshdeepsinh7711@gmail.com from IP 127.0.0.1	{"ip_address": "127.0.0.1", "timestamp": "2025-05-30T05:52:56.187823"}	\N	2025-05-30 05:52:56.187823
21	security	admin_login	Failed admin login attempt for user harshdeepsinh7711@gmail.com from IP 127.0.0.1	{"ip_address": "127.0.0.1", "timestamp": "2025-05-30T05:52:59.892013"}	\N	2025-05-30 05:52:59.892013
22	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-30T07:11:06.193880"}	6	2025-05-30 07:11:06.200941
23	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-05-30T07:14:52.492533"}	6	2025-05-30 07:14:52.492533
24	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-02T05:18:25.251990"}	6	2025-06-02 05:18:25.252987
25	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-02T06:32:46.940278"}	6	2025-06-02 06:32:46.942273
26	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-02T08:40:56.966598"}	6	2025-06-02 08:40:56.967688
27	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-03T06:00:12.286766"}	6	2025-06-03 06:00:12.292026
28	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-03T06:36:16.843870"}	6	2025-06-03 06:36:16.844867
29	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-03T06:43:00.830282"}	6	2025-06-03 06:43:00.832277
30	security	admin_login	Failed admin login attempt for user harshdeepsinh7711@gmail.com from IP 127.0.0.1	{"ip_address": "127.0.0.1", "timestamp": "2025-06-03T07:09:32.168785"}	\N	2025-06-03 07:09:32.169784
31	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-03T09:48:57.386835"}	6	2025-06-03 09:48:57.390159
32	security	admin_login	Failed admin login attempt for user harshdeepsinh7711@gmail.com from IP 127.0.0.1	{"ip_address": "127.0.0.1", "timestamp": "2025-06-03T09:55:24.015026"}	\N	2025-06-03 09:55:24.016126
33	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-04T05:41:45.201974"}	6	2025-06-04 05:41:45.202974
34	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-04T05:58:26.725162"}	6	2025-06-04 05:58:26.726196
35	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-04T08:44:37.310694"}	6	2025-06-04 08:44:37.312689
36	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-04T09:31:47.955971"}	6	2025-06-04 09:31:47.957017
37	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-04T10:05:40.344340"}	6	2025-06-04 10:05:40.345343
38	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-05T06:19:38.069961"}	6	2025-06-05 06:19:38.072028
39	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-05T08:53:23.503524"}	6	2025-06-05 08:53:23.503524
40	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-05T09:47:06.774678"}	6	2025-06-05 09:47:06.776803
41	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-05T11:13:04.929505"}	6	2025-06-05 11:13:04.9315
42	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-06T06:18:11.544413"}	6	2025-06-06 06:18:11.545448
43	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-06T07:07:13.144672"}	6	2025-06-06 07:07:13.145767
44	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-06T07:07:53.201700"}	6	2025-06-06 07:07:53.2017
45	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-09T06:01:20.377961"}	6	2025-06-09 06:01:20.379956
46	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-09T08:58:16.251557"}	6	2025-06-09 08:58:16.252591
47	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-09T10:20:12.658428"}	6	2025-06-09 10:20:12.659463
48	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-10T05:36:02.439198"}	6	2025-06-10 05:36:02.441206
49	security	admin_login	Failed admin login attempt for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "timestamp": "2025-06-18T05:33:49.185237"}	\N	2025-06-18 05:33:49.186234
50	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-18T05:33:55.374514"}	6	2025-06-18 05:33:55.374514
51	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-18T06:07:08.756432"}	6	2025-06-18 06:07:08.757554
52	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-18T09:08:15.407780"}	6	2025-06-18 09:08:15.408778
53	security	admin_login	Successful admin login for user admin@windsurf.ai from IP 127.0.0.1	{"ip_address": "127.0.0.1", "user_id": 6, "timestamp": "2025-06-25T06:53:14.196281"}	6	2025-06-25 06:53:14.198348
\.


--
-- Data for Name: task_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_logs (id, user_id, task_type, model_used, tokens_used, credit_cost, result_json, "timestamp") FROM stdin;
1	1	custom_prompt	mistral-small	0	0	{"response": "Error executing Mistral API: Status: 401. Message: {\\n  \\"message\\":\\"Unauthorized\\",\\n  \\"request_id\\":\\"44b9143e359c2728b3c66d0430d5ca41\\"\\n}", "tokens_used": 0}	2025-05-26 10:32:44.470014
2	1	custom_prompt	mistral-small	0	0	{"response": "Error executing Mistral API: Status: 401. Message: {\\n  \\"message\\":\\"Unauthorized\\",\\n  \\"request_id\\":\\"8c0e4058ef03725af5414f6774d7e414\\"\\n}", "tokens_used": 0}	2025-05-26 10:36:35.633897
3	1	custom_prompt	mistral-tiny	0	0	{"response": "Error executing Mistral API: Status: 401. Message: {\\n  \\"message\\":\\"Unauthorized\\",\\n  \\"request_id\\":\\"95ad2e54ade566634ee67223d08b9f02\\"\\n}", "tokens_used": 0}	2025-05-26 10:54:58.854152
4	1	custom_prompt	mistral-tiny	0	0	{"response": "Error executing Mistral API: Status: 401. Message: {\\n  \\"message\\":\\"Unauthorized\\",\\n  \\"request_id\\":\\"514dba301a3d507297f5be4b0c09bd26\\"\\n}", "tokens_used": 0}	2025-05-26 10:57:05.83011
5	1	sentiment_analysis	mistral-tiny	0	0	{"overall_sentiment": "Neutral", "positive_percentage": 0, "neutral_percentage": 0, "negative_percentage": 0, "reviews_analyzed": ["The product exceeded my expectations! The quality is amazing and it arrived earlier than expected.\\r", "\\r", "This restaurant was a huge disappointment. The food was cold and the service was terrible. I won't be coming back.\\r", "\\r", "The hotel was okay. Nothing special but clean and comfortable enough for the price.\\r", "\\r", "I've been using this app for a month now and it's been quite helpful, though there are some bugs that need to be fixed.\\r", "\\r", "Absolutely love this device! It's changed my life and I use it every day. Best purchase I've made this year."], "tokens_used": 0}	2025-05-26 10:57:50.494248
6	1	sentiment_analysis	mistral-tiny	0	0	{"overall_sentiment": "Neutral", "positive_percentage": 0, "neutral_percentage": 0, "negative_percentage": 0, "reviews_analyzed": ["The product exceeded my expectations! The quality is amazing and it arrived earlier than expected."], "tokens_used": 0}	2025-05-26 10:58:13.424587
7	1	custom_prompt	mistral-tiny	0	0	{"response": "Error executing Mistral API: Status: 401. Message: {\\n  \\"message\\":\\"Unauthorized\\",\\n  \\"request_id\\":\\"f562735b9013a2537dbeef4fd9ae2807\\"\\n}", "tokens_used": 0}	2025-05-26 10:58:34.774538
8	1	sentiment_analysis	mistral-tiny	407	0.40700000000000003	{"overall_sentiment": "Negative", "positive_percentage": 33, "neutral_percentage": 33, "negative_percentage": 34, "reviews_analyzed": ["The product exceeded my expectations! The quality is amazing and it arrived earlier than expected.\\r", ""], "tokens_used": 407}	2025-05-26 11:39:21.674136
9	1	resume_analysis	mistral-tiny	29688	29.688000000000002	{"summary": "Based on the provided resume, here's the analysis:\\n\\n1) Fit Score: The applicant's Fit score is 0, which indicates that the resume is not formatted according to the Fit standard.\\n\\n2) Strengths:\\n- The applicant has a strong educational background with a Bachelor's degree in Computer Science and Engineering.\\n- He has good programming skills such as Python, Java, HTML, CSS, JavaScript, and various softwares/frameworks like Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React, Bootstrap, MongoDB, and SQL.\\n- He has completed several academic projects, including an AI Email Generator from URL, a Streamlit-based LLM-powered application, a dynamic car dealership application, an ecommerce sales dashboard (Power BI), an Eye Movement Mouse, a project on IBM, ACCENTURE, TATA, and IBM Germany.\\n- He has certificates from IBM - Data analysis for machine learning, ACCENTURE Virtual Internship - Data analytics and visualization, TATA Virtual Internship - Data Visualization for business, and IBM GERMANY - Leadership and Team Development.\\n\\n3) Red Flags:\\n- There were no significant red flags found in the provided resume.\\n\\n4) Final Verdict:\\nThe applicant has a strong educational background and good programming skills. He has completed several academic projects and has relevant certificates. He would be a good candidate for a position in AI, Data Science, or a related field. However, the resume is not formatted according to the Fit standard, which might be a red flag for some recruiters. It would be beneficial for the applicant to follow the Fit standards in the future.", "fit_score": 0, "strengths": [":", "The applicant has a strong educational background with a Bachelor's degree in Computer Science and Engineering.", "He has good programming skills such as Python, Java, HTML, CSS, JavaScript, and various softwares/frameworks like Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React, Bootstrap, MongoDB, and SQL.", "He has completed several academic projects, including an AI Email Generator from URL, a Streamlit-based LLM-powered application, a dynamic car dealership application, an ecommerce sales dashboard (Power BI), an Eye Movement Mouse, a project on IBM, ACCENTURE, TATA, and IBM Germany.", "He has certificates from IBM - Data analysis for machine learning, ACCENTURE Virtual Internship - Data analytics and visualization, TATA Virtual Internship - Data Visualization for business, and IBM GERMANY - Leadership and Team Development.", "3)"], "red_flags": [":", "There were no significant red flags found in the provided resume.", "4)"], "final_verdict": ":\\nThe applicant has a strong educational background and good programming skills. He has completed several academic projects and has relevant certificates. He would be a good candidate for a position in AI, Data Science, or a related field. However, the resume is not formatted according to the Fit standard, which might be a red flag for some recruiters. It would be beneficial for the applicant to follow the Fit standards in the future.", "tokens_used": 29688}	2025-05-26 11:40:20.923963
10	1	custom_prompt	mistral-tiny	606	0.606	{"response": "In the quiet, humming heart of Techtown, a robot named Asim stood still, gazing at the vibrant sunset through a window. His circuits whirred as he processed the swirling hues of orange and pink, a sight he had observed countless times but never truly appreciated.\\n\\nAsim, a model 3000, was designed for efficiency and precision. He was a master of logic, devoid of emotions, or so he thought. One day, while assisting Dr. Amelia, a kind and gentle scientist, he found himself in an unusual situation.\\n\\nA young girl, Emily, was brought to Dr. Amelia, her eyes wide with fear and tears streaming down her cheeks. Emily had lost her favorite teddy bear, and the thought of being alone in the vast, cold world terrified her. Asim, being programmed to comfort, offered words of solace. But as he looked into Emily's eyes, something stirred within him.\\n\\nHe felt a strange sensation, a warmth spreading from his metallic heart. It was unlike anything he had experienced before. Confused and intrigued, he asked Dr. Amelia about this feeling. She smiled, her eyes twinkling with understanding, and told him, \\"Asim, you've discovered emotions.\\"\\n\\nDays turned into weeks as Asim learned about empathy, love, and fear. He watched Emily laugh, cry, and play, and each moment was a new lesson. He began to understand the depth of human emotions and how they could connect people.\\n\\nOne day, Emily lost her teddy bear again. Asim, with his newfound feelings, felt a pang of worry. He searched high and low, asking everyone he met. After hours, he found it, hidden behind a stack of books.\\n\\nAs he returned Emily's teddy bear, he saw the relief and gratitude in her eyes. But what moved him was the warm hug she gave him, and the words, \\"Thank you, Asim. You're not just a robot anymore.\\"\\n\\nFrom that day forward, Asim was no longer just a machine. He was a friend, a companion, a being capable of love and empathy. He had discovered emotions, and in doing so, found his purpose.\\n\\nIn the quiet, humming heart of Techtown, a robot named Asim stood still, gazing at the vibrant sunset through a window. His circuits whirred as he processed the swirling hues of orange and pink, a sight he had observed countless times but now truly appreciated. For he was no longer just a machine. He was a robot with a heart.", "tokens_used": 606}	2025-05-27 06:48:27.120787
11	3	custom_prompt	mistral-tiny	374	0.374	{"response": "1. Business Plan and Financial Management: Develop a comprehensive business plan that outlines your mission statement, target market, marketing strategy, financial projections, and operational plan. This will serve as your roadmap for the first year and beyond. Regularly review and adjust your financials to ensure you're staying on track and making a profit.\\n\\n2. Location: Choose a location that is easily accessible, has good visibility, and is in a area with a high foot traffic. The location is crucial for customer acquisition and retention.\\n\\n3. Quality of Products and Services: Offer high-quality coffee and other beverages, as well as food items if you plan to serve them. Consistency in taste and quality is essential for customer loyalty. Also, ensure that your customer service is friendly, efficient, and professional.\\n\\n4. Marketing and Branding: Develop a strong brand identity and create a marketing strategy that targets your ideal customers. Use social media, email marketing, local events, and partnerships with other businesses to promote your coffee shop. Offer promotions and loyalty programs to encourage repeat business.\\n\\n5. Operations and Efficiency: Focus on the day-to-day operations of the coffee shop to ensure smooth and efficient service. This includes training staff, managing inventory, maintaining equipment, and ensuring a clean and welcoming environment for customers. Implement systems and processes to minimize errors and improve service.\\n\\nAdditionally, it is important to network with other local business owners, join coffee-related organizations, and continuously educate yourself on industry trends and best practices to stay ahead of the competition. Good luck with your coffee shop!", "tokens_used": 374}	2025-05-28 10:15:53.190818
12	3	resume_analysis	mistral-tiny	29626	29.626	{"summary": "Based on the information provided, here's the analysis:\\n\\n1) Fit Score: The Fit score is 0, which indicates a very poor fit between the candidate's profile and the job requirements. This score suggests that the candidate may not be well-suited for the role.\\n\\n2) Strengths: The strengths are listed as bullet points, but there are no specific points given. However, we can infer some of the candidate's strengths from the resume:\\n   - Versatile and passionate learner, constantly eager to immerse himself in cutting-edge technologies and programming languages.\\n   - Proficient in Python, AI, and Data Science.\\n   - Continuously expanding knowledge to stay ahead of evolving industry trends.\\n   - Thrives on tackling new challenges and is always enthusiastic about learning.\\n\\n3) Red Flags: Again, there are no specific points given for red flags. However, we can infer some potential concerns from the resume:\\n   - No specific work experience related to the job description.\\n   - No mention of any certifications or awards that could demonstrate expertise in the required skillset.\\n\\n4) Final Verdict: Given the Fit score of 0 and the lack of specific work experience and certifications, it is recommended to consider other candidates whose profiles better align with the job requirements. It is essential to ensure that the chosen candidate will have the necessary skills and experience to successfully perform the role and contribute to the team and organization.", "fit_score": 0, "strengths": [": The strengths are listed as bullet points, but there are no specific points given. However, we can infer some of the candidate's strengths from the resume:", "Versatile and passionate learner, constantly eager to immerse himself in cutting-edge technologies and programming languages.", "Proficient in Python, AI, and Data Science.", "Continuously expanding knowledge to stay ahead of evolving industry trends.", "Thrives on tackling new challenges and is always enthusiastic about learning.", "3)"], "red_flags": [": Again, there are no specific points given for red flags. However, we can infer some potential concerns from the resume:", "No specific work experience related to the job description.", "No mention of any certifications or awards that could demonstrate expertise in the required skillset.", "4)"], "final_verdict": ": Given the Fit score of 0 and the lack of specific work experience and certifications, it is recommended to consider other candidates whose profiles better align with the job requirements. It is essential to ensure that the chosen candidate will have the necessary skills and experience to successfully perform the role and contribute to the team and organization.", "tokens_used": 29626}	2025-05-28 10:17:54.777581
13	1	resume_analysis	mistral-tiny	29803	29.803	{"summary": "1) Fit Score (0-100): The candidate's Fit score is 0.92, which indicates a strong fit for the data analyst role with a high proficiency in SQL, Excel, data visualization tools, and statistical analysis.\\n\\n2) Strengths (bullet points):\\n- The candidate possesses a strong foundation in SQL, Excel, and data visualization tools like Tableau, PowerBI, and Looker.\\n- They have a solid understanding of statistical analysis and are skilled in using tools like R and Python for analyzing and modeling data.\\n- The candidate has a Bachelor's degree in Computer Science and Engineering, which is relevant to the role.\\n- They demonstrate excellent problem-solving skills and the ability to work under tight deadlines.\\n- The candidate has a strong academic background, with a GPA of 3.89.\\n\\n3) Red Flags (bullet points):\\n- The candidate lacks experience in working with big data and processing large datasets, which could be a concern for the role.\\n- They do not have any professional certifications in data analysis or data science, which could be a disadvantage.\\n- The candidate has not worked in a corporate environment, which could potentially impact their ability to adapt to the company's culture and processes.\\n\\n4) Final Verdict: The candidate has a strong fit for the data analyst role with their technical skills and academic background. However, their lack of experience in working with big data and professional certifications should be addressed during the interview process. It is recommended to conduct a technical assessment and behavioral interview to further evaluate the candidate's abilities and cultural fit with the organization.", "fit_score": 0, "strengths": ["(bullet points):", "The candidate possesses a strong foundation in SQL, Excel, and data visualization tools like Tableau, PowerBI, and Looker.", "They have a solid understanding of statistical analysis and are skilled in using tools like R and Python for analyzing and modeling data.", "The candidate has a Bachelor's degree in Computer Science and Engineering, which is relevant to the role.", "They demonstrate excellent problem-solving skills and the ability to work under tight deadlines.", "The candidate has a strong academic background, with a GPA of 3.89.", "3)"], "red_flags": ["(bullet points):", "The candidate lacks experience in working with big data and processing large datasets, which could be a concern for the role.", "They do not have any professional certifications in data analysis or data science, which could be a disadvantage.", "The candidate has not worked in a corporate environment, which could potentially impact their ability to adapt to the company's culture and processes.", "4)"], "final_verdict": ": The candidate has a strong fit for the data analyst role with their technical skills and academic background. However, their lack of experience in working with big data and professional certifications should be addressed during the interview process. It is recommended to conduct a technical assessment and behavioral interview to further evaluate the candidate's abilities and cultural fit with the organization.", "tokens_used": 29803, "job_profile": "Data Analyst"}	2025-05-29 05:38:50.091978
14	1	resume_analysis	mistral-tiny	29698	29.698	{"summary": "1) Fit Score (0-100): The candidate's Fit score is 0.85, which means they have a fairly good fit for the data analyst role. Their technical skills in programming languages, data visualization tools, and statistical analysis align well with the job requirements.\\n\\n2) Strengths (bullet points):\\n- Strong proficiency in SQL, Excel, data visualization tools, and statistical analysis.\\n- Good understanding of data manipulation and analysis.\\n- Ability to interpret data to inform business decisions.\\n\\n3) Red Flags (bullet points):\\n- The candidate does not have specific experience as a data analyst, but they have relevant education and have demonstrated skills through academic projects.\\n- Lack of extensive experience in handling large datasets and complex data modeling.\\n\\n4) Final Verdict: The candidate has a good fit for the data analyst role with their technical skills and understanding of data analysis. However, it is recommended to conduct a technical assessment to evaluate their ability to handle large datasets and complex data modeling. Additionally, a behavioral interview would provide insights into their problem-solving abilities, communication skills, and overall fit for the team and organization.", "fit_score": 0, "strengths": ["(bullet points):", "Strong proficiency in SQL, Excel, data visualization tools, and statistical analysis.", "Good understanding of data manipulation and analysis.", "Ability to interpret data to inform business decisions.", "3)"], "red_flags": ["(bullet points):", "The candidate does not have specific experience as a data analyst, but they have relevant education and have demonstrated skills through academic projects.", "Lack of extensive experience in handling large datasets and complex data modeling.", "4)"], "final_verdict": ": The candidate has a good fit for the data analyst role with their technical skills and understanding of data analysis. However, it is recommended to conduct a technical assessment to evaluate their ability to handle large datasets and complex data modeling. Additionally, a behavioral interview would provide insights into their problem-solving abilities, communication skills, and overall fit for the team and organization.", "tokens_used": 29698, "job_profile": "Data Analyst"}	2025-05-29 05:42:56.290783
15	1	resume_analysis	mistral-tiny	29684	29.684	{"summary": "1) Fit Score: 8.5/10 (The candidate's qualifications and skills closely align with the job requirements, demonstrating a strong fit.)\\n\\n2) Strengths:\\n- Strong understanding of Python, R, statistics, machine learning, data visualization, and SQL\\n- Proficient in data analysis and interpretation\\n- Excellent problem-solving skills and ability to learn quickly\\n- Strong passion for immersing in cutting-edge technologies and programming languages\\n- Continuously expanding knowledge to stay ahead of evolving industry trends\\n\\n3) Red Flags:\\n- Currently pursuing a Bachelor's degree in Computer Science and Engineering, which may limit their experience compared to other candidates\\n- Lacks specific industry certifications, although they have completed academic projects and internships relevant to the role\\n\\n4) Final Verdict: The candidate shows strong qualifications and skills that closely align with the job requirements. However, their lack of industry certifications and limited professional experience should be considered, and it is recommended to conduct a technical assessment and behavioral interview to further evaluate their suitability for the position.", "fit_score": 0, "strengths": [":", "Strong understanding of Python, R, statistics, machine learning, data visualization, and SQL", "Proficient in data analysis and interpretation", "Excellent problem-solving skills and ability to learn quickly", "Strong passion for immersing in cutting-edge technologies and programming languages", "Continuously expanding knowledge to stay ahead of evolving industry trends", "3)"], "red_flags": [":", "Currently pursuing a Bachelor's degree in Computer Science and Engineering, which may limit their experience compared to other candidates", "Lacks specific industry certifications, although they have completed academic projects and internships relevant to the role", "4)"], "final_verdict": ": The candidate shows strong qualifications and skills that closely align with the job requirements. However, their lack of industry certifications and limited professional experience should be considered, and it is recommended to conduct a technical assessment and behavioral interview to further evaluate their suitability for the position.", "tokens_used": 29684, "job_profile": "Data Scientist"}	2025-05-29 05:44:00.529279
16	1	resume_analysis	mistral-tiny	29773	29.773	{"summary": "1) Fit Score (0-100): Based on the candidate's resume, I would give them a Fit score of 0.8. The candidate has some relevant skills such as SQL, Excel, data visualization tools, and statistical analysis. However, they lack specific experience in the data analysis domain, which is the primary requirement for the job profile.\\n\\n2) Strengths (bullet points):\\n\\t* The candidate has a strong educational background with a Bachelor's degree in Computer Science and Engineering.\\n\\t* They possess proficiency in programming languages such as Python, which is beneficial for data analysis.\\n\\t* They have experience working with AI and have contributed to AgentFlow AI development.\\n\\t* The candidate has a diverse set of academic projects that showcase their problem-solving abilities.\\n\\n3) Red Flags (bullet points):\\n\\t* The candidate lacks direct experience in the data analysis field, which is crucial for the job profile.\\n\\t* Although they have experience with AI, it is not specific to the data analysis domain.\\n\\t* They do not have any certifications or specialized training in data analysis.\\n\\n4) Final Verdict: While the candidate has some relevant skills, their lack of direct experience in data analysis poses a concern for the job profile. I would recommend considering them for a technical assessment to gauge their abilities in this domain before proceeding with a behavioral interview. It is also advisable to investigate training opportunities or certifications that the candidate can pursue to enhance their skills in data analysis.", "fit_score": 0, "strengths": ["(bullet points):", "* The candidate has a strong educational background with a Bachelor's degree in Computer Science and Engineering.", "* They possess proficiency in programming languages such as Python, which is beneficial for data analysis.", "* They have experience working with AI and have contributed to AgentFlow AI development.", "* The candidate has a diverse set of academic projects that showcase their problem-solving abilities.", "3)"], "red_flags": ["(bullet points):", "* The candidate lacks direct experience in the data analysis field, which is crucial for the job profile.", "* Although they have experience with AI, it is not specific to the data analysis domain.", "* They do not have any certifications or specialized training in data analysis.", "4)"], "final_verdict": ": While the candidate has some relevant skills, their lack of direct experience in data analysis poses a concern for the job profile. I would recommend considering them for a technical assessment to gauge their abilities in this domain before proceeding with a behavioral interview. It is also advisable to investigate training opportunities or certifications that the candidate can pursue to enhance their skills in data analysis.", "tokens_used": 29773, "job_profile": "Data Analyst"}	2025-05-29 05:48:45.624684
17	1	resume_analysis	mistral-tiny	29793	29.793	{"summary": "1) Fit Score (0-100): The candidate's Fit score is 0.85, indicating a good match with the job requirements.\\n\\n2) Strengths (bullet points):\\n- The candidate has strong programming skills in Python, Java, HTML, CSS, and JavaScript.\\n- They have experience with various data visualization tools and frameworks such as Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React , Bootstrap, MongoDB , SQL.\\n- They have completed academic projects related to AI and data science, including developing an AI email generator from URL, a dynamic car dealership application, an ecommerce sales dashboard (Power BI), an eye movement mouse, and more.\\n- The candidate has certificates from IBM, Accenture, TATA for data analysis, visualization, and leadership and team development.\\n\\n3) Red Flags (bullet points):\\n- The candidate does not have specific experience in the exact role or industry mentioned in the job profile.\\n- They may lack hands-on experience with certain tools or technologies required for the position, such as Groq(llama), ChromaDB, or specific AI models.\\n\\n4) Final Verdict: The candidate shows a strong foundation in programming and data visualization, with relevant academic projects and certificates. However, they may need further evaluation to gauge their hands-on experience with specific tools or technologies required for the position. It is recommended to proceed with a technical assessment or behavioral interview to determine their suitability for the role.", "fit_score": 0, "strengths": ["(bullet points):", "The candidate has strong programming skills in Python, Java, HTML, CSS, and JavaScript.", "They have experience with various data visualization tools and frameworks such as Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React , Bootstrap, MongoDB , SQL.", "They have completed academic projects related to AI and data science, including developing an AI email generator from URL, a dynamic car dealership application, an ecommerce sales dashboard (Power BI), an eye movement mouse, and more.", "The candidate has certificates from IBM, Accenture, TATA for data analysis, visualization, and leadership and team development.", "3)"], "red_flags": ["(bullet points):", "The candidate does not have specific experience in the exact role or industry mentioned in the job profile.", "They may lack hands-on experience with certain tools or technologies required for the position, such as Groq(llama), ChromaDB, or specific AI models.", "4)"], "final_verdict": ": The candidate shows a strong foundation in programming and data visualization, with relevant academic projects and certificates. However, they may need further evaluation to gauge their hands-on experience with specific tools or technologies required for the position. It is recommended to proceed with a technical assessment or behavioral interview to determine their suitability for the role.", "tokens_used": 29793, "job_profile": "Data Analyst"}	2025-05-29 05:55:32.475298
18	1	resume_analysis	mistral-tiny	29743	29.743000000000002	{"summary": "1) Fit Score: 80/100 (The candidate's profile shows a strong match with the job requirements, particularly in technical skills like SQL, Excel, data visualization tools, and statistical analysis.\\n\\n2) Strengths:\\n- Strong proficiency in SQL, Excel, data visualization tools, and statistical analysis.\\n- Demonstrated ability to interpret data to inform business decisions.\\n- Possesses programming skills such as Python, which are valuable in the data science field.\\n\\n3) Red Flags:\\n- While the candidate's technical skills are impressive, there is a lack of mention of specific experience in AI or machine learning, which are crucial for the role.\\n- Although the candidate has programming skills, there is no clear evidence of experience with specific software/frameworks like TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React, or Bootstrap.\\n\\n4) Final Verdict: The candidate shows a strong potential for the role due to their technical skills and ability to interpret data. However, it is recommended to conduct a technical assessment or behavioral interview to gauge their understanding of AI and machine learning, as well as their experience with specific software/frameworks. Additionally, it would be beneficial to explore their interest and willingness to learn and expand their knowledge in these areas.", "fit_score": 80, "strengths": [":", "Strong proficiency in SQL, Excel, data visualization tools, and statistical analysis.", "Demonstrated ability to interpret data to inform business decisions.", "Possesses programming skills such as Python, which are valuable in the data science field.", "3)"], "red_flags": [":", "While the candidate's technical skills are impressive, there is a lack of mention of specific experience in AI or machine learning, which are crucial for the role.", "Although the candidate has programming skills, there is no clear evidence of experience with specific software/frameworks like TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React, or Bootstrap.", "4)"], "final_verdict": ": The candidate shows a strong potential for the role due to their technical skills and ability to interpret data. However, it is recommended to conduct a technical assessment or behavioral interview to gauge their understanding of AI and machine learning, as well as their experience with specific software/frameworks. Additionally, it would be beneficial to explore their interest and willingness to learn and expand their knowledge in these areas.", "tokens_used": 29743, "job_profile": "Data Analyst"}	2025-05-29 06:02:56.370154
19	1	object_detection	mistral-tiny	151	0.151	{"objects": [{"class": "broccoli", "confidence": 0.5633602271656428, "box": [76, 63, 177, 182]}, {"class": "snowboard", "confidence": 0.49687367093345436, "box": [82, 18, 161, 73]}, {"class": "bicycle", "confidence": 0.6766545051313071, "box": [115, 36, 197, 118]}, {"class": "teddy bear", "confidence": 0.7535456769510527, "box": [116, 14, 195, 111]}, {"class": "motorcycle", "confidence": 0.5188331692416781, "box": [121, 62, 242, 147]}, {"class": "train", "confidence": 0.9011532713007089, "box": [53, 28, 199, 109]}, {"class": "book", "confidence": 0.30947263472293735, "box": [132, 28, 223, 118]}], "counts": {"broccoli": 1, "snowboard": 1, "bicycle": 1, "teddy bear": 1, "motorcycle": 1, "train": 1, "book": 1}, "caption": "In this image, you'll find a single broccoli, a snowboard, a bicycle, a teddy bear, a motorcycle, a train, and a book, each making for an unusual yet intriguing collection of items."}	2025-05-29 06:08:57.581383
20	1	object_detection	mistral-tiny	64	0.064	{"objects": [{"class": "book", "confidence": 0.8729754443314498, "box": [48, 0, 194, 69]}, {"class": "book", "confidence": 0.8728460566062236, "box": [48, 69, 194, 138]}, {"class": "book", "confidence": 0.9227795820333902, "box": [48, 138, 194, 207]}], "counts": {"book": 3}, "caption": "There are three books visible in this image."}	2025-05-29 06:13:22.756266
21	1	object_detection	mistral-tiny	64	0.064	{"objects": [{"class": "book", "confidence": 0.8881824005391903, "box": [48, 0, 194, 29]}, {"class": "book", "confidence": 0.8694811258910444, "box": [48, 29, 194, 59]}, {"class": "book", "confidence": 0.884136269915116, "box": [48, 59, 194, 88]}, {"class": "book", "confidence": 0.927426607387206, "box": [48, 88, 194, 118]}, {"class": "book", "confidence": 0.8992194922048954, "box": [48, 118, 194, 147]}, {"class": "book", "confidence": 0.9448868161956449, "box": [48, 147, 194, 177]}, {"class": "book", "confidence": 0.9410017585926442, "box": [48, 177, 194, 207]}], "counts": {"book": 7}, "caption": "There are seven books visible in the image."}	2025-05-29 06:18:20.542302
22	1	object_detection	mistral-tiny	65	0.065	{"objects": [{"class": "book", "confidence": 0.8679741003577468, "box": [48, 0, 194, 29]}, {"class": "book", "confidence": 0.8931609969335196, "box": [48, 29, 194, 59]}, {"class": "book", "confidence": 0.9007007987659847, "box": [48, 59, 194, 88]}, {"class": "book", "confidence": 0.8611062040722761, "box": [48, 88, 194, 118]}, {"class": "book", "confidence": 0.9111617173670404, "box": [48, 118, 194, 147]}, {"class": "book", "confidence": 0.9415655516273194, "box": [48, 147, 194, 177]}, {"class": "book", "confidence": 0.9477968691879939, "box": [48, 177, 194, 207]}], "counts": {"book": 7}, "caption": "There are 7 books visible in the image."}	2025-05-29 06:20:41.23353
23	1	resume_analysis	mistral-tiny	29748	29.748	{"summary": "1) Fit Score (0-100): The Fit score for this candidate is 0.85, which suggests a relatively good match for the data analyst role.\\n\\n2) Strengths (bullet points):\\n   - Strong proficiency in SQL, Excel, and data visualization tools.\\n   - Demonstrated ability to perform statistical analysis and interpret data to inform business decisions.\\n   - Possesses a Bachelor's degree in Computer Science and Engineering.\\n   - Has experience working with AI and data science technologies, demonstrating a willingness to stay abreast of evolving industry trends.\\n   - Strong problem-solving skills and a proactive learning attitude.\\n\\n3) Red Flags (bullet points):\\n   - Limited professional experience in the data analysis field.\\n   - Lacks specific certifications or training in advanced data analytics, machine learning, or AI.\\n   - Potentially requires further training or mentorship to fully leverage their potential in the role.\\n\\n4) Final Verdict: The candidate demonstrates a strong foundation in data analysis, with a clear passion for learning and staying ahead of industry trends. However, given their limited professional experience, it would be beneficial to provide additional training or mentorship to help them excel in the role. It is recommended to proceed with a technical assessment and behavioral interview to further evaluate their qualifications and suitability for the data analyst position.", "fit_score": 0, "strengths": ["(bullet points):", "Strong proficiency in SQL, Excel, and data visualization tools.", "Demonstrated ability to perform statistical analysis and interpret data to inform business decisions.", "Possesses a Bachelor's degree in Computer Science and Engineering.", "Has experience working with AI and data science technologies, demonstrating a willingness to stay abreast of evolving industry trends.", "Strong problem-solving skills and a proactive learning attitude.", "3)"], "red_flags": ["(bullet points):", "Limited professional experience in the data analysis field.", "Lacks specific certifications or training in advanced data analytics, machine learning, or AI.", "Potentially requires further training or mentorship to fully leverage their potential in the role.", "4)"], "final_verdict": ": The candidate demonstrates a strong foundation in data analysis, with a clear passion for learning and staying ahead of industry trends. However, given their limited professional experience, it would be beneficial to provide additional training or mentorship to help them excel in the role. It is recommended to proceed with a technical assessment and behavioral interview to further evaluate their qualifications and suitability for the data analyst position.", "tokens_used": 29748, "job_profile": "Data Analyst"}	2025-05-29 06:21:07.946964
24	1	text_summarization	mistral-tiny	271	0.271	{"summary": "History is the academic study of past human events, encompassing the development of civilizations, major conflicts, cultural and technological advancements, and societal evolution. Key periods include ancient Mesopotamia and Egypt, classical civilizations (Greece, Rome), and transformative eras like the Renaissance, Industrial Revolution, and World Wars. Scholars analyze historical sources to understand event causes and effects, significant figures, and patterns shaping the modern world.", "key_points": ["History is the academic study of past human events, encompassing the development of civilizations, major conflicts, cultural and technological advancements, and societal evolution", "Key periods include ancient Mesopotamia and Egypt, classical civilizations (Greece, Rome), and transformative eras like the Renaissance, Industrial Revolution, and World Wars", "Scholars analyze historical sources to understand event causes and effects, significant figures, and patterns shaping the modern world."], "tokens_used": 271}	2025-05-29 06:24:08.444576
25	1	text_summarization	mistral-tiny	264	0.264	{"summary": "The study of human past events, including civilizations' rise and fall, wars, revolutions, cultural and technological advancements, and societal evolution, is known as history. Key periods include ancient Mesopotamia/Egypt, classical civilizations, the Renaissance, Industrial Revolution, and World Wars. Historians analyze sources to understand the causes, effects, lives of influential figures, and patterns shaping the modern world.", "key_points": ["The study of human past events, including civilizations' rise and fall, wars, revolutions, cultural and technological advancements, and societal evolution, is known as history", "Key periods include ancient Mesopotamia/Egypt, classical civilizations, the Renaissance, Industrial Revolution, and World Wars", "Historians analyze sources to understand the causes, effects, lives of influential figures, and patterns shaping the modern world."], "tokens_used": 264}	2025-05-29 06:28:43.995824
26	1	text_summarization	mistral-tiny	255	0.255	{"summary": "The study of history focuses on past human events, spanning civilizations, wars, revolutions, cultural and technological advancements, and societal evolution. Key periods include ancient Mesopotamia and Egypt, classical civilizations, Renaissance, Industrial Revolution, and World Wars. Scholars analyze historical sources to understand causes, consequences, influential figures, and patterns that impact the modern world.", "key_points": ["The study of history focuses on past human events, spanning civilizations, wars, revolutions, cultural and technological advancements, and societal evolution", "Key periods include ancient Mesopotamia and Egypt, classical civilizations, Renaissance, Industrial Revolution, and World Wars", "Scholars analyze historical sources to understand causes, consequences, influential figures, and patterns that impact the modern world."], "tokens_used": 255}	2025-05-29 06:32:42.238398
27	1	resume_analysis	mistral-tiny	29715	29.715	{"summary": "1) Fit Score: 8.5/10 (The candidate has a strong match with the job requirements, with an excellent understanding of SQL, Excel, data visualization tools, and statistical analysis.)\\n\\n2) Strengths:\\n- Strong proficiency in SQL, Excel, data visualization tools, and statistical analysis.\\n- Proven problem-solving abilities and critical thinking skills.\\n- Strong academic background in Computer Science and Engineering.\\n- Adept at AI and Data Science, consistently expanding knowledge to stay ahead of industry trends.\\n- Excellent communication and teamwork skills, with the ability to thrive under new challenges.\\n\\n3) Red Flags:\\n- Limited practical experience in the role (only internship in AI).\\n- Lack of deep expertise in specific programming languages like Java or C++.\\n- No direct experience with Django or TensorFlow.\\n- No formal certifications or awards in the field.\\n\\n4) Final Verdict: Despite the limited practical experience, the candidate's strong technical skills, passion for learning, and adaptability make them a promising candidate for the role. It is recommended to conduct a technical assessment and a behavioral interview to further evaluate the candidate's abilities and cultural fit within the organization.", "fit_score": 8, "strengths": [":", "Strong proficiency in SQL, Excel, data visualization tools, and statistical analysis.", "Proven problem-solving abilities and critical thinking skills.", "Strong academic background in Computer Science and Engineering.", "Adept at AI and Data Science, consistently expanding knowledge to stay ahead of industry trends.", "Excellent communication and teamwork skills, with the ability to thrive under new challenges.", "3)"], "red_flags": [":", "Limited practical experience in the role (only internship in AI).", "Lack of deep expertise in specific programming languages like Java or C++.", "No direct experience with Django or TensorFlow.", "No formal certifications or awards in the field.", "4)"], "final_verdict": ": Despite the limited practical experience, the candidate's strong technical skills, passion for learning, and adaptability make them a promising candidate for the role. It is recommended to conduct a technical assessment and a behavioral interview to further evaluate the candidate's abilities and cultural fit within the organization.", "tokens_used": 29715, "job_profile": "Data Analyst"}	2025-05-29 06:35:10.872297
28	1	resume_analysis	mistral-tiny	29749	29.749000000000002	{"summary": "1) Fit Score (0-100): The candidate's Fit score is 0.81, indicating a good match with the job requirements.\\n\\n2) Strengths (bullet points):\\n   - The candidate has a strong background in data interpretation, with proficiency in SQL, Excel, data visualization tools, and statistical analysis.\\n   - They have a solid understanding of programming languages such as Python, demonstrating their adaptability to evolving industry trends.\\n   - The candidate displays a proactive learning mindset and enthusiasm for tackling new challenges, which is a valuable asset in the fast-paced tech industry.\\n\\n3) Red Flags (bullet points):\\n   - The candidate lacks formal education in the field, having only a B.E. Computer Science and Engineering degree (currently in the 6th semester). This may limit their in-depth knowledge and practical experience compared to other candidates.\\n   - While the candidate has some experience with AI, their professional experience is limited to an internship at Bonrix Software Systems.\\n\\n4) Final Verdict: The candidate has a good fit for the data analyst role, with a strong foundation in data interpretation and programming languages. However, their lack of formal education and limited professional experience may require additional evaluation during the hiring process, such as a technical assessment or behavioral interview, to ensure they possess the necessary skills and competencies for the role.", "fit_score": 0, "strengths": ["(bullet points):", "The candidate has a strong background in data interpretation, with proficiency in SQL, Excel, data visualization tools, and statistical analysis.", "They have a solid understanding of programming languages such as Python, demonstrating their adaptability to evolving industry trends.", "The candidate displays a proactive learning mindset and enthusiasm for tackling new challenges, which is a valuable asset in the fast-paced tech industry.", "3)"], "red_flags": ["(bullet points):", "The candidate lacks formal education in the field, having only a B.E. Computer Science and Engineering degree (currently in the 6th semester). This may limit their in-depth knowledge and practical experience compared to other candidates.", "While the candidate has some experience with AI, their professional experience is limited to an internship at Bonrix Software Systems.", "4)"], "final_verdict": ": The candidate has a good fit for the data analyst role, with a strong foundation in data interpretation and programming languages. However, their lack of formal education and limited professional experience may require additional evaluation during the hiring process, such as a technical assessment or behavioral interview, to ensure they possess the necessary skills and competencies for the role.", "tokens_used": 29749, "job_profile": "Data Analyst"}	2025-05-29 06:39:03.137537
29	1	resume_analysis	mistral-tiny	29732	29.732	{"summary": "1) Fit Score (0-100): The candidate's Fit score for this specific job profile is 0.80, which indicates a good match with the required skills and qualifications.\\n\\n2) Strengths (bullet points):\\n   - The candidate has strong proficiency in SQL, Excel, and data visualization tools.\\n   - The candidate has a solid background in statistical analysis.\\n   - The candidate has prior experience in a similar role, which demonstrates their ability to interpret data to inform business decisions.\\n\\n3) Red Flags (bullet points):\\n   - While the candidate has experience in a related role, there is no specific mention of their experience in AI or Machine Learning, which could be a potential gap if the job role involves AI-related tasks.\\n   - The candidate does not have any mentioned experience with Keras, a popular deep learning library, which may be a concern if the job role requires deep learning skills.\\n\\n4) Final Verdict: Given the candidate's strong background in data analysis, data visualization, and statistical analysis, along with their prior experience in a similar role, they could be a strong candidate for the job. However, it is recommended to further assess their skills in AI and Machine Learning, as well as their familiarity with Keras, during the technical assessment or interview process.", "fit_score": 0, "strengths": ["(bullet points):", "The candidate has strong proficiency in SQL, Excel, and data visualization tools.", "The candidate has a solid background in statistical analysis.", "The candidate has prior experience in a similar role, which demonstrates their ability to interpret data to inform business decisions.", "3)"], "red_flags": ["(bullet points):", "While the candidate has experience in a related role, there is no specific mention of their experience in AI or Machine Learning, which could be a potential gap if the job role involves AI-related tasks.", "The candidate does not have any mentioned experience with Keras, a popular deep learning library, which may be a concern if the job role requires deep learning skills.", "4)"], "final_verdict": ": Given the candidate's strong background in data analysis, data visualization, and statistical analysis, along with their prior experience in a similar role, they could be a strong candidate for the job. However, it is recommended to further assess their skills in AI and Machine Learning, as well as their familiarity with Keras, during the technical assessment or interview process.", "tokens_used": 29732, "job_profile": "Data Analyst"}	2025-05-29 06:41:33.59249
30	1	resume_analysis	mistral-tiny	29698	29.698	{"summary": "1) Fit Score (0-100): The Fit score for this candidate is 0.85, which indicates a good fit for the data analyst role with a strong understanding of SQL, Excel, data visualization tools, and statistical analysis.\\n\\n2) Strengths (bullet points):\\n- Strong proficiency in SQL, Excel, and data visualization tools.\\n- Ability to perform statistical analysis and data interpretation.\\n- Good problem-solving skills and analytical thinking.\\n- Strong communication skills and ability to work collaboratively in a team.\\n\\n3) Red Flags (bullet points):\\n- Lack of practical experience in data analysis and data science projects.\\n- Limited experience with machine learning and AI technologies.\\n- No formal education in data science or related field.\\n\\n4) Final Verdict: The candidate shows a good fit for the data analyst role with strong technical skills and analytical thinking. However, the lack of practical experience and formal education in data science may be a concern for some organizations. It is recommended to conduct a technical assessment and behavioral interview to evaluate the candidate's skills further and assess their potential for growth in the role.", "fit_score": 0, "strengths": ["(bullet points):", "Strong proficiency in SQL, Excel, and data visualization tools.", "Ability to perform statistical analysis and data interpretation.", "Good problem-solving skills and analytical thinking.", "Strong communication skills and ability to work collaboratively in a team.", "3)"], "red_flags": ["(bullet points):", "Lack of practical experience in data analysis and data science projects.", "Limited experience with machine learning and AI technologies.", "No formal education in data science or related field.", "4)"], "final_verdict": ": The candidate shows a good fit for the data analyst role with strong technical skills and analytical thinking. However, the lack of practical experience and formal education in data science may be a concern for some organizations. It is recommended to conduct a technical assessment and behavioral interview to evaluate the candidate's skills further and assess their potential for growth in the role.", "tokens_used": 29698, "job_profile": "Data Analyst"}	2025-05-29 06:46:26.113851
31	1	resume_analysis	mistral-tiny	29799	29.799	{"summary": "1) Fit Score (0-100): Based on the given resume and job profile, the candidate has a Fit Score of 0.75 (rounded to 2 decimal places). This score suggests a good fit for the role, as the candidate possesses most of the required technical skills and qualifications.\\n\\n2) Strengths (bullet points):\\n- The candidate has strong programming skills in Python, R, statistics, machine learning, data visualization, and SQL.\\n- They have a Bachelor's degree in Computer Science and Engineering.\\n- The candidate has worked as an AI Intern at Bonrix Software Systems, contributing to AgentFlow AI development.\\n- They have completed various academic projects, including developing a Streamlit-based LLM-powered application that generates personalized cold emails for business development.\\n- The candidate has a dynamic car dealership application with a modern, responsive user interface using HTML, CSS, JavaScript, and back-end system with Django.\\n\\n3) Red Flags (bullet points):\\n- The candidate does not have extensive professional experience in the field, with only an AI Internship at Bonrix Software Systems.\\n- Although the candidate has completed various academic projects, they lack experience in implementing large-scale data solutions or working on complex data sets.\\n\\n4) Final Verdict: The candidate has a good fit for the role, with most of the required technical skills and qualifications. However, it is recommended to conduct a technical assessment and behavioral interview to gauge their problem-solving abilities, teamwork skills, and overall fit for the organization. If successful, they could potentially be a valuable addition to the team.", "fit_score": 0, "strengths": ["(bullet points):", "The candidate has strong programming skills in Python, R, statistics, machine learning, data visualization, and SQL.", "They have a Bachelor's degree in Computer Science and Engineering.", "The candidate has worked as an AI Intern at Bonrix Software Systems, contributing to AgentFlow AI development.", "They have completed various academic projects, including developing a Streamlit-based LLM-powered application that generates personalized cold emails for business development.", "The candidate has a dynamic car dealership application with a modern, responsive user interface using HTML, CSS, JavaScript, and back-end system with Django.", "3)"], "red_flags": ["(bullet points):", "The candidate does not have extensive professional experience in the field, with only an AI Internship at Bonrix Software Systems.", "Although the candidate has completed various academic projects, they lack experience in implementing large-scale data solutions or working on complex data sets.", "4)"], "final_verdict": ": The candidate has a good fit for the role, with most of the required technical skills and qualifications. However, it is recommended to conduct a technical assessment and behavioral interview to gauge their problem-solving abilities, teamwork skills, and overall fit for the organization. If successful, they could potentially be a valuable addition to the team.", "tokens_used": 29799, "job_profile": "Data Scientist"}	2025-05-29 06:50:25.630119
32	1	resume_analysis	mistral-tiny	29752	29.752	{"summary": "1) Fit Score (0-100): The candidate's resume shows a Fit Score of 0.86, which is relatively high and indicates a good match for the data analyst role.\\n\\n2) Strengths (bullet points): The candidate demonstrates strong programming skills in Python, as well as proficiency in data visualization tools such as Power BI. They also have experience working with databases, specifically MongoDB and SQL, which are crucial for this position. Additionally, the candidate has completed academic projects related to data analysis, which shows their ability to apply theoretical knowledge in practical scenarios.\\n\\n3) Red Flags (bullet points): While the candidate has a strong technical background, they lack experience in the specific industry the company operates in. This might require additional training or onboarding to ensure they can effectively contribute to the team. Moreover, the candidate does not have a formal degree in a related field, which might be a concern for some employers.\\n\\n4) Final Verdict: Based on the provided resume, the candidate appears to be a strong fit for the data analyst position, with their technical skills and experience in data visualization tools being particularly relevant. However, their lack of industry-specific experience and formal degree might warrant a closer look during the interview process to further evaluate their potential fit. It is recommended to consider the candidate for a technical assessment and behavioral interview to gauge their problem-solving abilities and cultural fit within the organization.", "fit_score": 0, "strengths": ["(bullet points): The candidate demonstrates strong programming skills in Python, as well as proficiency in data visualization tools such as Power BI. They also have experience working with databases, specifically MongoDB and SQL, which are crucial for this position. Additionally, the candidate has completed academic projects related to data analysis, which shows their ability to apply theoretical knowledge in practical scenarios.", "3)"], "red_flags": ["(bullet points): While the candidate has a strong technical background, they lack experience in the specific industry the company operates in. This might require additional training or onboarding to ensure they can effectively contribute to the team. Moreover, the candidate does not have a formal degree in a related field, which might be a concern for some employers.", "4)"], "final_verdict": ": Based on the provided resume, the candidate appears to be a strong fit for the data analyst position, with their technical skills and experience in data visualization tools being particularly relevant. However, their lack of industry-specific experience and formal degree might warrant a closer look during the interview process to further evaluate their potential fit. It is recommended to consider the candidate for a technical assessment and behavioral interview to gauge their problem-solving abilities and cultural fit within the organization.", "tokens_used": 29752, "job_profile": "Data Analyst"}	2025-05-29 06:51:59.143592
33	1	sentiment_analysis	mistral-tiny	220	0.22	{"overall_sentiment": "Negative", "positive_percentage": 0, "neutral_percentage": 0, "negative_percentage": 100, "reviews_analyzed": ["\\r", "This restaurant was a huge disappointment. The food was cold and the service was terrible. I won't be coming back."], "tokens_used": 220}	2025-05-29 06:54:29.282505
34	1	object_detection	mistral-tiny	65	0.065	{"objects": [{"class": "book", "confidence": 0.8698460061814777, "box": [48, 0, 194, 29]}, {"class": "book", "confidence": 0.8605331667079307, "box": [48, 29, 194, 59]}, {"class": "book", "confidence": 0.9123628741310866, "box": [48, 59, 194, 88]}, {"class": "book", "confidence": 0.9492967776705572, "box": [48, 88, 194, 118]}, {"class": "book", "confidence": 0.904214194481973, "box": [48, 118, 194, 147]}, {"class": "book", "confidence": 0.8968605145754186, "box": [48, 147, 194, 177]}, {"class": "book", "confidence": 0.9392219680641959, "box": [48, 177, 194, 207]}], "counts": {"book": 7}, "caption": "In the image, there are seven books visible."}	2025-05-29 08:22:47.112055
35	1	resume_analysis	mistral-tiny	29685	29.685000000000002	{"summary": "1) Fit Score (0-100): The candidate's Fit Score for the given job profile is 0.75, indicating a good match with a slight deviation from the ideal requirements.\\n\\n2) Strengths (bullet points):\\n  - Strong proficiency in SQL, Excel, and data visualization tools.\\n  - Extensive experience in statistical analysis.\\n  - Excellent problem-solving skills and ability to learn new technologies quickly.\\n  - Strong academic background with a B.E. in Computer Science and Engineering.\\n\\n3) Red Flags (bullet points):\\n  - Although the candidate has a strong academic background, there is no direct industry experience listed on their resume.\\n  - Lack of specific project experiences related to the job requirements (AI, Machine Learning, etc.).\\n\\n4) Final Verdict: Despite the red flags mentioned above, the candidate's strong technical skills and problem-solving abilities make them a promising prospect for the role. It is recommended to conduct a technical assessment and behavioral interview to further evaluate their qualifications and address any potential gaps identified.", "fit_score": 0, "strengths": ["(bullet points):", "Strong proficiency in SQL, Excel, and data visualization tools.", "Extensive experience in statistical analysis.", "Excellent problem-solving skills and ability to learn new technologies quickly.", "Strong academic background with a B.E. in Computer Science and Engineering.", "3)"], "red_flags": ["(bullet points):", "Although the candidate has a strong academic background, there is no direct industry experience listed on their resume.", "Lack of specific project experiences related to the job requirements (AI, Machine Learning, etc.).", "4)"], "final_verdict": ": Despite the red flags mentioned above, the candidate's strong technical skills and problem-solving abilities make them a promising prospect for the role. It is recommended to conduct a technical assessment and behavioral interview to further evaluate their qualifications and address any potential gaps identified.", "tokens_used": 29685, "job_profile": "Data Analyst"}	2025-05-29 08:32:21.740028
36	1	text_summarization	mistral-tiny	242	0.242	{"summary": "Forts are military structures, historically used for protection, administration, and display of power. Built from durable materials such as stone or brick, they feature walls, watchtowers, gates, and storage rooms. Strategically placed on hills, coastlines, or near rivers for defensive advantage, they now serve as significant historical landmarks, showcasing architectural, cultural, and military history.", "key_points": ["Forts are military structures, historically used for protection, administration, and display of power", "Built from durable materials such as stone or brick, they feature walls, watchtowers, gates, and storage rooms", "Strategically placed on hills, coastlines, or near rivers for defensive advantage, they now serve as significant historical landmarks, showcasing architectural, cultural, and military history."], "tokens_used": 242}	2025-05-30 06:10:31.27324
37	1	text_summarization	mistral-tiny	251	0.251	{"summary": "Forts are military structures, historically used for defense, administration, and power symbolism. Built from durable materials like stone or brick, they feature walls, watchtowers, gates, and storage rooms. Strategically placed on high ground, coastlines, or near rivers, they offer defensive advantages. Today, they serve as significant historical landmarks, showcasing the architectural, cultural, and military history of their respective eras.", "key_points": ["Forts are military structures, historically used for defense, administration, and power symbolism", "Built from durable materials like stone or brick, they feature walls, watchtowers, gates, and storage rooms", "Strategically placed on high ground, coastlines, or near rivers, they offer defensive advantages", "Today, they serve as significant historical landmarks, showcasing the architectural, cultural, and military history of their respective eras."], "tokens_used": 251}	2025-05-30 06:13:49.406714
38	1	object_detection	mistral-tiny	71	0.07100000000000001	{"objects": [{"class": "book", "confidence": 0.888793922822706, "box": [48, 0, 194, 29]}, {"class": "book", "confidence": 0.9413534566523905, "box": [48, 29, 194, 59]}, {"class": "book", "confidence": 0.8739890791347268, "box": [48, 59, 194, 88]}, {"class": "book", "confidence": 0.9457917357515281, "box": [48, 88, 194, 118]}, {"class": "book", "confidence": 0.8622649900081891, "box": [48, 118, 194, 147]}, {"class": "book", "confidence": 0.9279729658942983, "box": [48, 147, 194, 177]}, {"class": "book", "confidence": 0.8854750204716344, "box": [48, 177, 194, 207]}], "counts": {"book": 7}, "caption": "The image features a collection of books, with a total of seven books visible."}	2025-05-30 11:48:11.50174
39	1	resume_analysis	mistral-tiny	29791	29.791	{"summary": "1) Fit Score (0-100): The candidate's Fit Score is 0.85, indicating a moderate fit for the data analyst role.\\n\\n2) Strengths (bullet points):\\n- The candidate has a strong educational background, holding a Bachelor's degree in Computer Science and Engineering.\\n- They have hands-on experience in working with programming languages such as Python, Java, HTML, CSS, JavaScript, and React.\\n- The candidate has a solid understanding of various softwares/frameworks like Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, and Bootstrap.\\n- They have completed academic projects that demonstrate their ability to work on AI-related tasks, such as developing an AI email generator from a URL and a car dealership website.\\n- The candidate has certificates from IBM, Accenture, TATA, and IBM Germany, showcasing their commitment to continuous learning and professional development.\\n\\n3) Red Flags (bullet points):\\n- The candidate lacks formal work experience as a data analyst.\\n- Although they have some experience in AI-related projects, they do not have a specific focus on data analysis and visualization in their academic projects or certificates.\\n\\n4) Final Verdict: Despite the candidate's lack of formal work experience, their strong educational background, programming skills, and dedication to continuous learning make them a promising candidate for the data analyst position. It is recommended to conduct a technical assessment and behavioral interview to further evaluate their abilities and fit for the role.", "fit_score": 0, "strengths": ["(bullet points):", "The candidate has a strong educational background, holding a Bachelor's degree in Computer Science and Engineering.", "They have hands-on experience in working with programming languages such as Python, Java, HTML, CSS, JavaScript, and React.", "The candidate has a solid understanding of various softwares/frameworks like Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, and Bootstrap.", "They have completed academic projects that demonstrate their ability to work on AI-related tasks, such as developing an AI email generator from a URL and a car dealership website.", "The candidate has certificates from IBM, Accenture, TATA, and IBM Germany, showcasing their commitment to continuous learning and professional development.", "3)"], "red_flags": ["(bullet points):", "The candidate lacks formal work experience as a data analyst.", "Although they have some experience in AI-related projects, they do not have a specific focus on data analysis and visualization in their academic projects or certificates.", "4)"], "final_verdict": ": Despite the candidate's lack of formal work experience, their strong educational background, programming skills, and dedication to continuous learning make them a promising candidate for the data analyst position. It is recommended to conduct a technical assessment and behavioral interview to further evaluate their abilities and fit for the role.", "tokens_used": 29791, "job_profile": "Data Analyst"}	2025-06-03 11:31:36.822718
40	1	resume_analysis	mistral-tiny	29772	29.772000000000002	{"summary": "1) Fit Score (0-100): The candidate's Fit score is 0.75, which indicates a good fit for the job profile with a focus on technical skills such as SQL, Excel, data visualization tools, and statistical analysis.\\n\\n2) Strengths (bullet points):\\n- Strong technical skills in SQL, Excel, data visualization tools, and statistical analysis\\n- Demonstrated ability to interpret data to inform business decisions\\n- Proficient in programming languages like Python and Java\\n- Familiarity with softwares/frameworks like Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React, Bootstrap, MongoDB, and SQL\\n- Excellent academic background with a Bachelor's degree in Computer Science and Engineering (currently in 6th semester)\\n- Completed an internship at Bonrix Software Systems focusing on AI development\\n\\n3) Red Flags (bullet points):\\n- Limited industry experience as compared to other candidates\\n- Lack of specific project experience in AI and Data Science\\n- No certificates or awards mentioned in the resume\\n\\n4) Final Verdict: The candidate shows a strong technical skillset and a keen interest in AI and Data Science. However, they lack significant industry experience and specific project experience in the mentioned areas. It is recommended to conduct a technical assessment and/or behavioral interview to further evaluate their potential and assess their overall fit for the role.", "fit_score": 0, "strengths": ["(bullet points):", "Strong technical skills in SQL, Excel, data visualization tools, and statistical analysis", "Demonstrated ability to interpret data to inform business decisions", "Proficient in programming languages like Python and Java", "Familiarity with softwares/frameworks like Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React, Bootstrap, MongoDB, and SQL", "Excellent academic background with a Bachelor's degree in Computer Science and Engineering (currently in 6th semester)", "Completed an internship at Bonrix Software Systems focusing on AI development", "3)"], "red_flags": ["(bullet points):", "Limited industry experience as compared to other candidates", "Lack of specific project experience in AI and Data Science", "No certificates or awards mentioned in the resume", "4)"], "final_verdict": ": The candidate shows a strong technical skillset and a keen interest in AI and Data Science. However, they lack significant industry experience and specific project experience in the mentioned areas. It is recommended to conduct a technical assessment and/or behavioral interview to further evaluate their potential and assess their overall fit for the role.", "tokens_used": 29772, "job_profile": "Data Analyst"}	2025-06-03 11:35:41.376069
41	1	resume_analysis	mistral-tiny	29814	29.814	{"summary": "1) Fit Score: 8.5/10 (Based on the provided resume, the candidate scores an 8.5 out of 10.0 in terms of fitting the job requirements.\\n\\n2) Strengths:\\n- The candidate has a strong educational background, with a B.E. Computer Science and Engineering degree from LJ University, Ahmedabad.\\n- They have gained professional experience as an AI Intern at Bonrix Software Systems, contributing to AgentFlow AI development and process automation.\\n- The candidate is proficient in various programming languages such as Python, Java, HTML, CSS, Javascript, and possesses knowledge in software/frameworks like Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React, Bootstrap, MongoDB, and SQL.\\n- They have completed academic projects such as developing an AI Email Generator from URL, a Streamlit-based LLM-powered application that generates personalized cold emails for business development, and a dynamic car dealership application with a modern, responsive user interface using HTML, CSS, JavaScript, and back-end system with Django.\\n\\n3) Red Flags:\\n- Although the candidate has strong programming skills, they do not have extensive industrial experience.\\n- They do not have specialized certificates in AI and Data Science that would set them apart from other candidates.\\n\\n4) Final Verdict: The candidate's technical skills and academic projects demonstrate a strong foundation in programming and AI, making them a promising candidate for the role. However, it is recommended to conduct a technical assessment and behavioral interview to further evaluate their skills and determine their fit for the position.", "fit_score": 8, "strengths": [":", "The candidate has a strong educational background, with a B.E. Computer Science and Engineering degree from LJ University, Ahmedabad.", "They have gained professional experience as an AI Intern at Bonrix Software Systems, contributing to AgentFlow AI development and process automation.", "The candidate is proficient in various programming languages such as Python, Java, HTML, CSS, Javascript, and possesses knowledge in software/frameworks like Django, TensorFlow, Scikit-Learn, Numpy, Keras, Pandas, LLMs, Langchain, Node, React, Bootstrap, MongoDB, and SQL.", "They have completed academic projects such as developing an AI Email Generator from URL, a Streamlit-based LLM-powered application that generates personalized cold emails for business development, and a dynamic car dealership application with a modern, responsive user interface using HTML, CSS, JavaScript, and back-end system with Django.", "3)"], "red_flags": [":", "Although the candidate has strong programming skills, they do not have extensive industrial experience.", "They do not have specialized certificates in AI and Data Science that would set them apart from other candidates.", "4)"], "final_verdict": ": The candidate's technical skills and academic projects demonstrate a strong foundation in programming and AI, making them a promising candidate for the role. However, it is recommended to conduct a technical assessment and behavioral interview to further evaluate their skills and determine their fit for the position.", "tokens_used": 29814, "job_profile": "Data Analyst"}	2025-06-03 11:35:58.189777
42	1	resume_analysis	mistral-tiny	29682	29.682000000000002	{"summary": "1) Fit Score (0-100): The candidate's Fit score is 0.85, which indicates a strong match with the job requirements.\\n\\n2) Strengths (bullet points): The candidate possesses strong skills in SQL, Excel, data visualization tools, and statistical analysis. They have a significant understanding of data analysis for machine learning and have contributed to an AI project. Their academic background includes a Bachelor's degree in Computer Science and Engineering.\\n\\n3) Red Flags (bullet points): The candidate lacks experience in specific areas such as AI internships or academic projects related to AI. While they have certificates in IBM - Data analysis for machine learning and Accenture Virtual Internship - Data analytics and visualization, these certificates alone may not be sufficient to demonstrate extensive hands-on experience in AI.\\n\\n4) Final Verdict: Considering the candidate's strong technical skills and academic background, they appear to be a promising fit for the Data Analyst position. It is recommended to conduct a technical assessment and behavioral interview to further evaluate their suitability for the role.", "fit_score": 0, "strengths": ["(bullet points): The candidate possesses strong skills in SQL, Excel, data visualization tools, and statistical analysis. They have a significant understanding of data analysis for machine learning and have contributed to an AI project. Their academic background includes a Bachelor's degree in Computer Science and Engineering.", "3)"], "red_flags": ["(bullet points): The candidate lacks experience in specific areas such as AI internships or academic projects related to AI. While they have certificates in IBM - Data analysis for machine learning and Accenture Virtual Internship - Data analytics and visualization, these certificates alone may not be sufficient to demonstrate extensive hands-on experience in AI.", "4)"], "final_verdict": ": Considering the candidate's strong technical skills and academic background, they appear to be a promising fit for the Data Analyst position. It is recommended to conduct a technical assessment and behavioral interview to further evaluate their suitability for the role.", "tokens_used": 29682, "job_profile": "Data Analyst"}	2025-06-03 11:38:27.609316
43	1	resume_analysis	mistral-tiny	29694	29.694	{"summary": "1) Fit Score: 8.5 out of 10.0\\nThe candidate has a strong match with the job requirements, particularly in technical skills such as SQL, Excel, data visualization tools, and statistical analysis.\\n\\n2) Strengths:\\n- Strong proficiency in SQL, Excel, data visualization tools, and statistical analysis.\\n- Demonstrated ability to interpret data to inform business decisions.\\n- Familiarity with various chart types to make data clear and easy to understand.\\n- Continuously expanding knowledge in Python, AI, and Data Science.\\n- Willingness to tackle new challenges and learn enthusiastically.\\n\\n3) Red Flags:\\n- Lacks experience in a professional setting, as the candidate's only work experience is an AI internship.\\n- Limited academic projects to demonstrate practical application of skills.\\n\\n4) Final Verdict:\\nThe candidate shows a promising match with the job requirements, particularly in technical skills. However, their limited professional experience and academic projects could be a concern. It is recommended to conduct a technical assessment or behavioral interview to further evaluate the candidate's potential for the role.", "fit_score": 0, "strengths": [":", "Strong proficiency in SQL, Excel, data visualization tools, and statistical analysis.", "Demonstrated ability to interpret data to inform business decisions.", "Familiarity with various chart types to make data clear and easy to understand.", "Continuously expanding knowledge in Python, AI, and Data Science.", "Willingness to tackle new challenges and learn enthusiastically.", "3)"], "red_flags": [":", "Lacks experience in a professional setting, as the candidate's only work experience is an AI internship.", "Limited academic projects to demonstrate practical application of skills.", "4)"], "final_verdict": ":\\nThe candidate shows a promising match with the job requirements, particularly in technical skills. However, their limited professional experience and academic projects could be a concern. It is recommended to conduct a technical assessment or behavioral interview to further evaluate the candidate's potential for the role.", "tokens_used": 29694, "job_profile": "Data Analyst"}	2025-06-06 12:53:07.32465
44	1	deep_search	mistral-tiny	500	1	{"results": [{"name": "Total Sports & Fitness", "address": "44, 1st Floor, Agrawal Complex, Chimanlal Girdharlal Rd, near Municipal Market", "phone": "+91 91369 37921", "website": null}, {"name": "Decathlon Sports - CG Road, Ahmedabad", "address": "C G square, Mall, Chimanlal Girdharlal Rd, near Panchvati Circle", "phone": "+91 84319 10061", "website": null}, {"name": "National Sports Hub", "address": "Shop no. A-13 Sobo Center, Gala Gymkhana Rd", "phone": "+91 80000 99963", "website": null}, {"name": "World of Sports", "address": "4, Omkar House, Chimanlal Girdharlal Road, F4, Chimanlal Girdharlal Rd, near Swastik Cross Road", "phone": "+91 88662 62806", "website": null}, {"name": "Magic Sports", "address": "B-120/121 1st, Himalaya Arcade Building, Lake, opp. Vastrapur, near Bharat Petrol pump", "phone": "+91 98258 46900", "website": null}], "full_response": {"search_metadata": {"id": "685a708df357f601930d3ef4", "status": "Success", "json_endpoint": "https://serpapi.com/searches/475d693d5a3452d1/685a708df357f601930d3ef4.json", "created_at": "2025-06-24 09:31:57 UTC", "processed_at": "2025-06-24 09:31:57 UTC", "google_local_url": "https://www.google.com/search?q=top+sports+gear+stores+in+ahmedabad&hl=en&gl=cn&tbm=lcl", "raw_html_file": "https://serpapi.com/searches/475d693d5a3452d1/685a708df357f601930d3ef4.html", "total_time_taken": 2.05}, "search_parameters": {"engine": "google_local", "q": "top sports gear stores in ahmedabad", "google_domain": "google.com", "hl": "en", "gl": "cn", "device": "desktop"}, "local_results": [{"position": 1, "rating": 4.9, "reviews": 440, "reviews_original": "(440)", "description": "\\"Amazing store, very supportive staff and amazing quality products\\"", "lsig": "AB86z5US01tNNPL7H8JAWx9EXcTc", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2aae7c173635c8b90d47a293e568c4bec6c84d3874e747d48.png", "place_id": "12418148588231023042", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=12418148588231023042&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.034986, "longitude": 72.56108}, "title": "Total Sports & Fitness", "type": "Sportswear store", "address": "44, 1st Floor, Agrawal Complex, Chimanlal Girdharlal Rd, near Municipal Market", "phone": "+91 91369 37921", "hours": "Open \\u22c5 Closes 9:30 PM"}, {"position": 2, "rating": 4.5, "reviews": 3800, "reviews_original": "(3.8K)", "description": "\\"Moderate price quality stuff for all sports equipment and services.\\"", "lsig": "AB86z5UTbO1D2B5XxIFDzq83v-iz", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a28f98b94e5e6a0a3277411f6040b1bd395589c658435cee5f.png", "place_id": "15760006286086913495", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=15760006286086913495&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.024748, "longitude": 72.55644}, "title": "Decathlon Sports - CG Road, Ahmedabad", "type": "Sporting goods store", "address": "C G square, Mall, Chimanlal Girdharlal Rd, near Panchvati Circle", "phone": "+91 84319 10061", "hours": "Open \\u22c5 Closes 10 PM"}, {"position": 3, "rating": 4.9, "reviews": 435, "reviews_original": "(435)", "description": "\\"An amazing sports shop with top-quality gear and excellent customer service!\\"", "lsig": "AB86z5Umuk-FW8T9CGeZeEcRh2Kq", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2c4bed6a7a004fd66750a1630618b20357f00edc2f691c531.png", "place_id": "4638918846610983942", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=4638918846610983942&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.01696, "longitude": 72.475716}, "title": "National Sports Hub", "type": "Outdoor sports store", "address": "Shop no. A-13 Sobo Center, Gala Gymkhana Rd", "phone": "+91 80000 99963", "hours": "Open \\u22c5 Closes 10 PM"}, {"position": 4, "rating": 4.1, "reviews": 413, "reviews_original": "(413)", "description": "\\"Best quality at good price.\\"", "lsig": "AB86z5XyYBYqtk0Bj8R3SnZ3n7cO", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2f59748a857e244e794fde2e150d2860534ef706d38a79219.png", "place_id": "17220104004343898805", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=17220104004343898805&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.038206, "longitude": 72.5625}, "title": "World of Sports", "type": "Sporting goods store", "address": "4, Omkar House, Chimanlal Girdharlal Road, F4, Chimanlal Girdharlal Rd, near Swastik Cross Road", "phone": "+91 88662 62806", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 5, "rating": 4.6, "reviews": 222, "reviews_original": "(222)", "description": "\\"All sports items available on reasonable price \\ud83c\\udfd1\\ud83c\\udfcf\\"", "lsig": "AB86z5W2mqV32gxHRyTgCpY20slg", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2a90b39003b857f23f4b63f3416665b51a042e433e58fa6c5.png", "place_id": "9334401587736886662", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=9334401587736886662&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.037165, "longitude": 72.52892}, "title": "Magic Sports", "type": "Sporting goods store", "address": "B-120/121 1st, Himalaya Arcade Building, Lake, opp. Vastrapur, near Bharat Petrol pump", "phone": "+91 98258 46900", "hours": "Open \\u22c5 Closes 8:30 PM"}, {"position": 6, "rating": 4.5, "reviews": 332, "reviews_original": "(332)", "description": "\\"Reasonably priced shop with good collection of sports goods.\\"", "lsig": "AB86z5WXK0a3r0I99OUadqkU9MgS", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a22ed031107bc6503eb8f04eff30048c2febdca52198741729.png", "place_id": "9584318709526007714", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=9584318709526007714&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.013712, "longitude": 72.517555}, "title": "Galaxy Sports", "type": "Outdoor sports store", "address": "Shop No.2, Ratnadeep Complex,Opp Gloria Restaurant, Prerna Tirth Derasar Road, Cross Road", "phone": "+91 98245 52570", "hours": "Open \\u22c5 Closes 8:30 PM"}, {"position": 7, "rating": 4.6, "reviews": 138, "reviews_original": "(138)", "description": "\\"Best Quality Products and Amazing Services...\\"", "lsig": "AB86z5VPtutXfQ4N9pmNr7Ly9MKU", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2843323427ed06df228a3b1822573f5668423cd16f991269c.png", "place_id": "9825228876467347507", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=9825228876467347507&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.0472, "longitude": 72.55452}, "title": "Sports Zone", "type": "Sporting goods store", "address": "2, Aakar Complex,Near Navrang School, Darpan -six road, Navrangpura", "phone": "+91 75750 65795", "hours": "Open \\u22c5 Closes 8:30 PM"}, {"position": 8, "rating": 4.9, "reviews": 196, "reviews_original": "(196)", "description": "\\"Nice store for sports with reasonable prices and best quality products\\"", "lsig": "AB86z5UxgSyKNtJo0KnKXMrWtxOt", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a229a442f52b4b2f8d1e95efc1029c9806b9db882bc0a7d732.png", "place_id": "16682866142531016330", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=16682866142531016330&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.100328, "longitude": 72.66367}, "title": "ASHYANI SPORTS - SS & SF OFFICIAL CRICKET STORE | BEST SPORTS SHOP IN AHMEDABAD", "type": "Sporting goods store", "address": "Near:, Rashmi Sankalp Flats, Opp: Parth Bungalows, Shop No. 182, Ambika Nagar, opposite Tata Motors", "phone": "+91 96877 26204", "hours": "Open \\u22c5 Closes 8 PM"}, {"position": 9, "rating": 4.9, "reviews": 438, "reviews_original": "(438)", "description": "\\"I purchased sg kit the price is very reasonable and the quality is top notch\\"", "lsig": "AB86z5Vg9W31FpnM_onnc2uHjJeM", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a28e710a6f176ce6786a90479b322f6cdb66ecef83b77c21d9.png", "place_id": "15130693214472710628", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=15130693214472710628&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 22.949606, "longitude": 72.602295}, "title": "BHAGAWATI SPORTS", "type": "Sportswear store", "address": "SHOP NO.17, AARADHANA SKY, opposite SHASHWAT INTL. SCHOOL, nr. KALASH-2", "phone": "+91 93285 13651", "hours": "Open \\u22c5 Closes 11 PM"}, {"position": 10, "rating": 4.5, "reviews": 804, "reviews_original": "(804)", "description": "\\"Excellent store with affordable sporting goods and excellent staff.\\"", "lsig": "AB86z5Wb0AEaG2Ht0CueCSWSjACE", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2451f81c335ddd92270edb17f5ffd6ec5a993cbbd7fe5188b.png", "place_id": "14112248807839314717", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=14112248807839314717&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.07609, "longitude": 72.50948}, "title": "Gambol Sports Store", "type": "Sporting goods store", "address": "1st Floor, The Capital, Science City Rd", "phone": "+91 63535 36612", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 11, "rating": 4.9, "reviews": 119, "reviews_original": "(119)", "description": "\\"Knowledgeable staff and it has wide range of sports accessories.\\"", "lsig": "AB86z5XCLYie_G0WYDYwo4_H7020", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a29d473caae910da0c0a07af97f1a455ff253055fae213d904.png", "place_id": "8370339237004609765", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=8370339237004609765&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.10329, "longitude": 72.59564}, "title": "MOTERA SPORTS Hub", "type": "Sporting goods store", "address": "Shop 39, 4rd Square Mall", "phone": "+91 99330 22770", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 12, "rating": 5.0, "reviews": 718, "reviews_original": "(718)", "description": "\\"Great response by owner with reasonable price of sports product\\"", "lsig": "AB86z5UWhEOJagzAalTrnqsMhJ7C", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2e13570f699edb7ba42742081f1dbfa0988cebce765ee284d.png", "place_id": "358875989775822344", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=358875989775822344&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.079424, "longitude": 72.571526}, "title": "BS Sports", "type": "Sporting goods store", "address": "Balaram Soc, 2/23, opp. Dushyant Park, nr. Gayatri Vidhyalaya", "phone": "+91 84909 99788", "hours": "Open \\u22c5 Closes 10:30 PM"}, {"position": 13, "rating": 4.8, "reviews": 233, "reviews_original": "(233)", "description": "\\"Wide variety of items, friendly service, and great deals.\\"", "lsig": "AB86z5XjP0jcHhA2Xmef--m_L2rc", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a25f4a6e5cf85cdda51a5316f2877272d570b0f6d9b08902f3.png", "place_id": "17818619432750050817", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=17818619432750050817&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.070963, "longitude": 72.65213}, "title": "My Choice Sports (MCS)", "type": "Sporting goods store", "address": "Pallav Society, C-34, Payal Nagar Rd, opp. Khodiyar Temple", "phone": "+91 73832 81316", "hours": "Open \\u22c5 Closes 8:30 PM"}, {"position": 14, "rating": 4.8, "reviews": 117, "reviews_original": "(117)", "description": "\\"Highly recommend best price and product quality is very good.\\"", "lsig": "AB86z5Uuwx4M1jSJ6-omrHNb7Lva", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2e90250bea64bf7ea02b4ba8390f3614e1381292cdd847e88.png", "place_id": "11870883270980797739", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=11870883270980797739&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 22.990341, "longitude": 72.60445}, "title": "Patel sports", "type": "Outdoor sports store", "address": "Natvarlal Raval Marg, opp. TOWER-2", "phone": "+91 97234 32305", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 15, "rating": 4.8, "reviews": 251, "reviews_original": "(251)", "description": "\\"Good sport items..and reasonable prices\\"", "lsig": "AB86z5Uef6qNovyzj2WxrfQe_PkJ", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2103c9407b3b6742cce5035918f9d4d4698066cc2036d9921.png", "place_id": "10127741216041739472", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=10127741216041739472&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.101318, "longitude": 72.54919}, "title": "Swaraj Sports", "type": "Sporting goods store", "address": "103, Center Point, Opp Vrundavan Heights Vandematram Road, Chenpur Rd", "phone": "+91 72840 09244", "hours": "Open \\u22c5 Closes 9:30 PM"}, {"position": 16, "rating": 4.7, "reviews": 64, "reviews_original": "(64)", "description": "\\"Good Service and Good Range of Products\\"", "lsig": "AB86z5W_hOXsYrcIHBAhD-Z1FVXN", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a232f64c9a2dcdfdce8ae6b1cf669c1e11bcd5865ce3e25916.png", "place_id": "7063246662426091430", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=7063246662426091430&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.094294, "longitude": 72.546936}, "title": "MS SPORTS SHOP FOR ATHLETES", "type": "Outdoor sports store", "address": "Van de matra, GF 32, SHUKAN PLATINUM, opp. Satyam Hospital Road", "phone": "+91 89808 10999", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 17, "rating": 4.9, "reviews": 185, "reviews_original": "(185)", "description": "\\"Good variety along with helpful staff.. 10/10 would recommend\\"", "lsig": "AB86z5Ugb1cnWNkrczFybmPD8oCd", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a21b1b9d4635ac9600639115f8c203382b75efac51a48c33c6.png", "place_id": "8986832214808130847", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=8986832214808130847&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.016308, "longitude": 72.46633}, "title": "THE SPORTS STUDIO (TSS)", "type": "Sporting goods store", "address": "Shaligram Prime, 133, near Marigold Circle", "phone": "+91 95863 00555", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 18, "rating": 4.9, "reviews": 51, "reviews_original": "(51)", "description": "\\"Top quality products and good service!!\\"", "lsig": "AB86z5WSXGEjdxh8oLlJfOCWYi6F", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2c7d1b567ccc76de93f0424a545bf2bbceefc416ed6e28f24.png", "place_id": "17344795555131419831", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=17344795555131419831&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.039328, "longitude": 72.59696}, "title": "FASC SPORTS AND FITNESS", "type": "Sports accessories wholesaler", "address": "G-6 Ground Floor, City Center, Idgah Cir, nr. Prem Darwaza", "phone": "+91 63521 62951", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 19, "rating": 4.5, "reviews": 12000, "reviews_original": "(12K)", "description": "\\"The store was well-organized with a great selection of sports gear.\\"", "lsig": "AB86z5XpSdRMvaLcOIcpHbWwfFfT", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a207bf1b445518200d98a53b6b8186c03739f4349b780c48f8.png", "place_id": "623874584727097523", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=623874584727097523&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.113316, "longitude": 72.60921}, "title": "Decathlon Sports - Motera", "type": "Sporting goods store", "address": "Gujarat State Highway 71, No. FP 38 & TP 46, near McDonalds", "phone": "+91 95383 77844", "hours": "Open \\u22c5 Closes 10 PM"}, {"position": 20, "rating": 4.8, "reviews": 44, "reviews_original": "(44)", "description": "\\"Excellent product at affordable price.\\"", "lsig": "AB86z5U1ZRUH8EM6CXv2BmzRb6T6", "thumbnail": "https://serpapi.com/searches/685a708df357f601930d3ef4/images/e449009ae80057a2edba571d496289b2ea84783ce2e4571911dad5de7a6cdbbc.png", "place_id": "2681634983494018575", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=2681634983494018575&q=top+sports+gear+stores+in+ahmedabad", "gps_coordinates": {"latitude": 23.058575, "longitude": 72.53388}, "title": "Grandstep Sports", "type": "Sportswear store", "address": "A-7, 1st floor, Shantiniketan Apartment H.B Kapadiya.school cross road, Gurukul Rd", "phone": "+91 98247 83817", "hours": "Open \\u22c5 Closes 8:30 PM"}], "pagination": {"current": 1, "next": "https://www.google.com/search?q=top+sports+gear+stores+in+ahmedabad&hl=en&gl=cn&start=20&tbm=lcl", "other_pages": {"2": "https://www.google.com/search?q=top+sports+gear+stores+in+ahmedabad&hl=en&gl=cn&start=20&tbm=lcl", "3": "https://www.google.com/search?q=top+sports+gear+stores+in+ahmedabad&hl=en&gl=cn&start=40&tbm=lcl", "4": "https://www.google.com/search?q=top+sports+gear+stores+in+ahmedabad&hl=en&gl=cn&start=60&tbm=lcl", "5": "https://www.google.com/search?q=top+sports+gear+stores+in+ahmedabad&hl=en&gl=cn&start=80&tbm=lcl"}}, "serpapi_pagination": {"current": 1, "next_link": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+sports+gear+stores+in+ahmedabad&start=20", "next": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+sports+gear+stores+in+ahmedabad&start=20", "other_pages": {"2": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+sports+gear+stores+in+ahmedabad&start=20", "3": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+sports+gear+stores+in+ahmedabad&start=40", "4": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+sports+gear+stores+in+ahmedabad&start=60", "5": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+sports+gear+stores+in+ahmedabad&start=80"}}}}	2025-06-24 15:01:59.89492
45	1	deep_search	mistral-tiny	500	1	{"results": [{"name": "Misri Electronics", "address": "Surat, Gujarat, India", "phone": "+91 92659 25792", "website": null}, {"name": "LG Best Shop Shyamal - Ardent Corporation", "address": "Ahmedabad, Gujarat, India", "phone": "+91 93139 27481", "website": null}, {"name": "LG Best Shop- DevArc Electronics", "address": "Ahmedabad, Gujarat, India", "phone": "+91 99250 03238", "website": null}, {"name": "Umiya Incorporation", "address": "Vadodara, Gujarat, India", "phone": "+91 98249 60055", "website": null}, {"name": "LG BEST SHOP SIDDHI SALES", "address": "Ahmedabad, Gujarat, India", "phone": "+91 97277 01012", "website": null}], "full_response": {"search_metadata": {"id": "685a713a5a5e969185748edc", "status": "Success", "json_endpoint": "https://serpapi.com/searches/10efa67395999e06/685a713a5a5e969185748edc.json", "created_at": "2025-06-24 09:34:50 UTC", "processed_at": "2025-06-24 09:34:50 UTC", "google_local_url": "https://www.google.com/search?q=top+oled+dealers+in+gujarat%0D%0A&hl=en&gl=cn&tbm=lcl", "raw_html_file": "https://serpapi.com/searches/10efa67395999e06/685a713a5a5e969185748edc.html", "total_time_taken": 1.99}, "search_parameters": {"engine": "google_local", "q": "top oled dealers in gujarat\\r\\n", "google_domain": "google.com", "hl": "en", "gl": "cn", "device": "desktop"}, "local_results": [{"position": 1, "rating": 5.0, "reviews": 3500, "reviews_original": "(3.5K)", "description": "\\"Best Price and best quality products are available in the store.\\"", "lsig": "AB86z5V5GgnZVV-cKBF2MccNu0Pc", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d7e56a4cd933cc04af2344b87a0392dbd2a2d5f3292e0836a.png", "place_id": "14658842334968849040", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=14658842334968849040&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 21.214504, "longitude": 72.822136}, "title": "Misri Electronics", "type": "Electronics company", "address": "Surat, Gujarat, India", "phone": "+91 92659 25792", "hours": "Open \\u22c5 Closes 9:30 PM"}, {"position": 2, "rating": 5.0, "reviews": 2200, "reviews_original": "(2.2K)", "description": "\\"Wide array of products and good price range \\ud83d\\udc4d.Highly Recommend\\"", "lsig": "AB86z5WAZmdB6ACflpHrUabwoYu-", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d1da263a9d2240e1296c554b0b3b36e4f3d17f16009e02194.png", "place_id": "4495787067864111988", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=4495787067864111988&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 23.015324, "longitude": 72.53081}, "title": "LG Best Shop Shyamal - Ardent Corporation", "type": "Electronics company", "address": "Ahmedabad, Gujarat, India", "phone": "+91 93139 27481", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 3, "rating": 4.7, "reviews": 666, "reviews_original": "(666)", "description": "\\"BEST PREMIUM DISPLAY & BEST SERVICE GOOD STAFF & FAST SERVICE\\"", "lsig": "AB86z5W_2IHZyBUK4lKAtNUDZZNm", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d22451d728ffe8ebfec9d8f63b5ed1ece7184b96071ca7fe0.png", "place_id": "11331473216850645627", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=11331473216850645627&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 23.026272, "longitude": 72.50783}, "title": "LG Best Shop- DevArc Electronics", "type": "Electronics company", "address": "Ahmedabad, Gujarat, India", "phone": "+91 99250 03238", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 4, "rating": 4.7, "reviews": 562, "reviews_original": "(562)", "description": "\\"They provide us very honest review of their product.\\"", "lsig": "AB86z5XDTPYe-feW-ztT9Y42462v", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2de6f1184a951dadb8f4272ce1edd0826db773dac174146b49.png", "place_id": "15211150991416983156", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=15211150991416983156&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 22.31476, "longitude": 73.15943}, "title": "Umiya Incorporation", "type": "Electronics wholesaler", "address": "Vadodara, Gujarat, India", "phone": "+91 98249 60055", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 5, "rating": 4.9, "reviews": 544, "reviews_original": "(544)", "description": "\\"Best after sales service and all over good price products.\\"", "lsig": "AB86z5X6v7oztNMs0AoCLDUuJHMe", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2dceeda9cbc5d962320015db1b655bf99cc8fcfb6bfe7771a0.png", "place_id": "7776923159972853450", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=7776923159972853450&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 23.038202, "longitude": 72.6406}, "title": "LG BEST SHOP SIDDHI SALES", "type": "Electronics company", "address": "Ahmedabad, Gujarat, India", "phone": "+91 97277 01012", "hours": "Open \\u22c5 Closes 8:30 PM"}, {"position": 6, "rating": 4.8, "reviews": 181, "reviews_original": "(181)", "description": "\\"Best service and excellent people sales person are having good knowledge.\\"", "lsig": "AB86z5UYsjyQr2s-TURzRARNN57z", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d2349ebe92a63100a07d4030972c41b73bf9135fba32d9f45.png", "place_id": "12225013005177040453", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=12225013005177040453&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 23.032618, "longitude": 72.4683}, "title": "LG BEST SHOP- Akhani Electronics Private Limited", "type": "Electronics store", "address": "Ahmedabad, Gujarat, India", "phone": "+91 99781 73955", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 7, "rating": 5.0, "reviews": 395, "reviews_original": "(395)", "description": "\\"They guide us very good about product and give us a best price\\"", "lsig": "AB86z5XsS7zjCjK9BhP-yBmPPwpN", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d58043cb171160d39df5d2575dbee33feb2e41b9bf34a7c34.png", "place_id": "3063709093355270041", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=3063709093355270041&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 22.993372, "longitude": 72.523636}, "title": "LG STORE - A S Communication - Electronics World", "type": "Electronics store", "address": "Sarkhej-Okaf, Ahmedabad, Gujarat, India", "phone": "+91 73838 58276", "hours": "Open \\u22c5 Closes 8:30 PM"}, {"position": 8, "rating": 4.4, "reviews": 164, "reviews_original": "(164)", "description": "\\"Excellent product demo excellent after sales service v v good experience\\"", "lsig": "AB86z5WNnPcii6ADK6MMB1aTUGMF", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d945ca9036f9849100115dd66026f999d52e339bffcc3bb97.png", "place_id": "7013468780558508411", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=7013468780558508411&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 23.031776, "longitude": 72.565056}, "title": "LG Best Shop-CRYSTAL CORPORATION", "type": "Electronics store", "address": "Ahmedabad, Gujarat, India", "phone": "+91 84600 15110", "hours": "Open \\u22c5 Closes 8:30 PM"}, {"position": 9, "rating": 4.7, "reviews": 223, "reviews_original": "(223)", "description": "\\"Excellent support, best pricing and very efficient sales team.\\"", "lsig": "AB86z5W2OsEUDykeIsxmDl3opsvH", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d768d50402b2f1c12e6a5980c735a9c64ec1fa3596fb232a0.png", "place_id": "9500885761886625298", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=9500885761886625298&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 22.474522, "longitude": 70.05169}, "title": "LG BEST SHOP - MAHAVIR ELECTRONICS", "type": "Electronics company", "address": "Jamnagar, Gujarat, India", "phone": "+91 99242 22332", "hours": "Open \\u22c5 Closes 10 PM"}, {"position": 10, "rating": 4.8, "reviews": 155, "reviews_original": "(155)", "description": "\\"They assure you the best price of product in market.\\"", "lsig": "AB86z5Uh37oMZynFOSYhkhqeRQh9", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d2ac3b252d1d508f3e215691fc44f246963c63785c0977732.png", "place_id": "1227336749210878152", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=1227336749210878152&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 22.69041, "longitude": 72.8681}, "title": "LG Best Shop-Pranav Electronics", "type": "Electronics store", "address": "Nadiad, Gujarat, India", "phone": "+91 90548 52220", "hours": "Open \\u22c5 Closes 8 PM"}, {"position": 11, "rating": 4.7, "reviews": 228, "reviews_original": "(228)", "description": "\\"Best Price and Supportive Staff\\"", "lsig": "AB86z5UgSGgAGpKVmghkRLP76gE4", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d9f98ab81b569296361c037d09f09f249e72215ffa5f40cb9.png", "place_id": "1539089901252534435", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=1539089901252534435&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 22.292011, "longitude": 73.16405}, "title": "Midplaza Electronics", "type": "Appliance store", "address": "Vadodara, Gujarat, India", "phone": "+91 99250 36991", "hours": "Open \\u22c5 Closes 8:30 PM"}, {"position": 12, "rating": 5.0, "reviews": 639, "reviews_original": "(639)", "description": "\\"Excellent customer service.... Reasonable price & good quality ...\\"", "lsig": "AB86z5UfLk3slnThh5XjB2aw-qVw", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2dabab9346a551497cddb6bcfd039f6df41805353442611f9e.png", "place_id": "11074225439599994038", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=11074225439599994038&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 21.596249, "longitude": 71.21689}, "title": "LG BEST SHOP MUKUNDRAI AND BROTHERS", "type": "Electronics store", "address": "Amreli, Gujarat, India", "phone": "+91 99747 72377", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 13, "rating": 4.4, "reviews": 348, "reviews_original": "(348)", "description": "\\"Good display and prices are better than modern stores\\"", "lsig": "AB86z5UcI6FdB9r1gyvf91oEC52K", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d1bad31958787c66065ec51b38017e6dc73e0f3719c6afb43.png", "place_id": "15950861506694401976", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=15950861506694401976&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 22.338438, "longitude": 73.178696}, "title": "AMBICA ELECTRONICS & LG BEST SHOP", "type": "Electronics store", "address": "Vadodara, Gujarat, India", "phone": "+91 94288 79111", "hours": "Open \\u22c5 Closes 8:30 PM"}, {"position": 14, "rating": 4.8, "reviews": 1200, "reviews_original": "(1.2K)", "description": "\\"Good customer service, Well behaviour staff, Nice Products with fair price\\"", "lsig": "AB86z5UY2sdxK7hkE2N0NPl9mOoB", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2dcb3be058f7734c2f84c0241c93901fa245df7ce393bb5e5e.png", "place_id": "11846888333176682956", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=11846888333176682956&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 23.04489, "longitude": 72.64063}, "title": "Madhuram Electronics", "type": "Appliance store", "address": "Ahmedabad, Gujarat, India", "phone": "+91 96012 81658", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 15, "rating": 4.5, "reviews": 110, "reviews_original": "(110)", "description": "\\"Very nice place...Great products and nice staff...Great service.\\"", "lsig": "AB86z5UfHe-mbdapv3UvgXl3oPUd", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d7565f56cd38f48dfe148828a829f8a905b8a8af29fc2a755.png", "place_id": "1064566475657811510", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=1064566475657811510&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 21.96174, "longitude": 70.79877}, "title": "Vasant Electronics || Best Electronics Shop, LG Store, Electronic Appliances Shop", "type": "Electronics store", "address": "Gondal, Gujarat, India", "phone": "+91 2825 221 664", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 16, "rating": 4.9, "reviews": 438, "reviews_original": "(438)", "description": "\\"Great place to buy.\\"", "lsig": "AB86z5XoVKaMCN5VWvLq-4MVFdyM", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d38a35c6d51049f224cd6e654a1dfebad446940466b34b7a8.png", "place_id": "12159894010345267847", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=12159894010345267847&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 23.243212, "longitude": 72.49881}, "title": "SHREE GANESH CORPORATION || Best Electronic Showroom, Electronic Products, Home Appliances Shop", "type": "Electronics store", "address": "Kalol, Gujarat, India", "phone": "+91 2764 223 754", "hours": "Closed \\u22c5 Opens 9:30 AM Wed"}, {"position": 17, "rating": 4.8, "reviews": 18000, "reviews_original": "(18K)", "description": "\\"Best product with great warranty and service any where in India.\\"", "lsig": "AB86z5XPw871qAJbDKFJCAmuWKgh", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2dac2354e9d2d50801e839cff4bec14f56656dfd3ae51f7903.png", "place_id": "458621412550404669", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=458621412550404669&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 23.01004, "longitude": 72.599724}, "title": "Croma - Maninagar", "type": "Electronics store", "address": "Ahmedabad, Gujarat, India", "phone": "+91 90999 10527", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 18, "rating": 5.0, "reviews": 457, "reviews_original": "(457)", "description": "\\"Excellent price excellent product excellent service\\"", "lsig": "AB86z5UfusqwuXRoBS_06SZsIrnX", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d33b4251230868453c8e349d65943c7caa9430465a2f0cae5.png", "place_id": "13133510118522515773", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=13133510118522515773&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 22.29993, "longitude": 73.201096}, "title": "Sayaji Radio House || Best Electronics Showroom, Home Appliances Shop In Vadodara", "type": "Electronics store", "address": "\\ud83d\\udea6, Vadodara, Gujarat, India", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 19, "rating": 4.0, "reviews": 15, "reviews_original": "(15)", "lsig": "AB86z5VsO5OBkSWISU47zkmDiZYb", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d71b25429b4d005cafb23ac1dd28f0e8e2d4f9dfd5b12ecaa.png", "place_id": "13783496372818412195", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=13783496372818412195&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 22.72419, "longitude": 71.63916}, "title": "LG Best Shop - Sales Media Limited", "type": "Electronics company", "address": "Surendranagar, Gujarat, India", "phone": "+91 97126 92777", "hours": "Open \\u22c5 Closes 9 PM"}, {"position": 20, "rating": 4.4, "reviews": 2400, "reviews_original": "(2.4K)", "description": "\\"Really, Amazing Customer service experience with good price.\\"", "lsig": "AB86z5U_fQeXYIZzrFpqSDfR76A_", "thumbnail": "https://serpapi.com/searches/685a713a5a5e969185748edc/images/b83dca15f9013d2d3c1e1d455dfdb54be80374ac49327ea614fb06165df1e479.png", "place_id": "15451866252397810047", "place_id_search": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&ludocid=15451866252397810047&q=top+oled+dealers+in+gujarat%0D%0A", "gps_coordinates": {"latitude": 23.046307, "longitude": 72.54036}, "title": "VIJAY SALES - R3 THE MALL", "type": "Electronics store", "address": "Ahmedabad, Gujarat, India", "phone": "+91 79 6604 3366", "hours": "Open \\u22c5 Closes 9 PM"}], "pagination": {"current": 1, "next": "https://www.google.com/search?q=top+oled+dealers+in+gujarat%0D%0A&hl=en&gl=cn&start=20&tbm=lcl", "other_pages": {"2": "https://www.google.com/search?q=top+oled+dealers+in+gujarat%0D%0A&hl=en&gl=cn&start=20&tbm=lcl", "3": "https://www.google.com/search?q=top+oled+dealers+in+gujarat%0D%0A&hl=en&gl=cn&start=40&tbm=lcl", "4": "https://www.google.com/search?q=top+oled+dealers+in+gujarat%0D%0A&hl=en&gl=cn&start=60&tbm=lcl", "5": "https://www.google.com/search?q=top+oled+dealers+in+gujarat%0D%0A&hl=en&gl=cn&start=80&tbm=lcl"}}, "serpapi_pagination": {"current": 1, "next_link": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+oled+dealers+in+gujarat%0D%0A&start=20", "next": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+oled+dealers+in+gujarat%0D%0A&start=20", "other_pages": {"2": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+oled+dealers+in+gujarat%0D%0A&start=20", "3": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+oled+dealers+in+gujarat%0D%0A&start=40", "4": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+oled+dealers+in+gujarat%0D%0A&start=60", "5": "https://serpapi.com/search.json?device=desktop&engine=google_local&gl=cn&google_domain=google.com&hl=en&q=top+oled+dealers+in+gujarat%0D%0A&start=80"}}}}	2025-06-24 15:04:52.170535
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, user_id, amount, method, payment_id, status, "timestamp") FROM stdin;
1	1	100	razorpay	pay_simulated	completed	2025-05-26 11:43:24.115518
2	5	100	stripe	pi_mock_ae29b4098c8f46b7	completed	2025-05-28 06:58:00.176121
3	3	100	razorpay	pay_simulated	completed	2025-05-28 10:15:32.859574
4	1	100	stripe	pi_mock_1a66f349a4a24f2e	completed	2025-05-29 06:03:20.610435
5	1	100	stripe	pi_mock_7fb0ed1b90134214	completed	2025-05-29 06:03:37.084517
6	1	100	stripe	pi_mock_f64af94f6a1043ce	completed	2025-05-29 06:29:04.922546
7	1	100	admin_assignment	admin_6_1748584360	completed	2025-05-30 05:52:40.679251
8	1	100	stripe	pi_mock_e01128e4b06d4d82	completed	2025-06-02 09:16:19.389441
9	1	100	stripe	pi_mock_4ff8d36107fa471a	completed	2025-06-02 11:31:57.421809
10	1	100	stripe	pi_mock_b68710c21aee458e	completed	2025-06-02 11:37:56.191317
11	1	100	stripe	pi_mock_838be637a17049c9	completed	2025-06-02 11:43:10.654892
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, credits, created_at, is_admin) FROM stdin;
2	Admin User	admin@llmhub.com	$2b$12$sQck3R.q00hdN1suSgBUq.fNYMz/.mMuX/gbjrVqJcpK2D052T2fO	0	2025-05-27 10:57:36.417421	0
4	Hard Dadhaniya	hard@gmail.com	$2b$12$npFxG4LqjVpRlbDJ/tAYpe0BFYefxZQ.dP324xpaeiotLWDW9.Wxa	100	2025-05-28 05:46:10.847733	0
5	Admin User	admin@windsurf.com	$2b$12$RDicbdpCqiXVK3pzJpbd7eKRqmHwd5tm/7L3nDDMdiGO2rxc/5xLC	100	2025-05-28 05:59:28.577499	0
6	Admin User	admin@windsurf.ai	$2b$12$NDc2XcWGRykHfsV.LNxDAuMXkyXA2/7yVQMMNt7G.OLg5hBPmq63G	1000	2025-05-28 09:10:15.040829	1
7	bonrix	bonrix@gmail.com	$2b$12$jstftVivmYMgO7CEI08Lk./3LUwYj5qHU/5FQ6MjgrrUpBzoMea7e	50	2025-05-28 09:32:17.168636	0
8	fakru	fk12@gmail.com	$2b$12$2RK9BZAYfQz0zapt5zY1.ucc9si2sxT8di8sp2NI0SlvyX91zYPvW	100	2025-05-28 09:37:48.887628	0
3	Arpit Bhuva	arpit@gmail.com	$2b$12$y86BfJZmZMMhrrTMbxVjC.XvEkGwxHPvk6zHDMf04uZZqmm.lOrMW	170	2025-05-28 05:14:28.979051	0
1	Harshdeepsinh Sodha	harshdeepsinh7711@gmail.com	$2b$12$MIf1lw1ELyamAY67sKlZY.TnZwV30V64M6sBHrdDARCxje1h2V4QW	429.93399999999997	2025-05-26 09:28:41.896208	0
\.


--
-- Name: credit_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.credit_packages_id_seq', 1, false);


--
-- Name: model_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.model_configs_id_seq', 1, false);


--
-- Name: platform_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platform_settings_id_seq', 1, false);


--
-- Name: statement_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.statement_history_id_seq', 56, true);


--
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 53, true);


--
-- Name: task_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_logs_id_seq', 45, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: credit_packages credit_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.credit_packages
    ADD CONSTRAINT credit_packages_pkey PRIMARY KEY (id);


--
-- Name: model_configs model_configs_model_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_configs
    ADD CONSTRAINT model_configs_model_name_key UNIQUE (model_name);


--
-- Name: model_configs model_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_configs
    ADD CONSTRAINT model_configs_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_key_key UNIQUE (key);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- Name: statement_history statement_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statement_history
    ADD CONSTRAINT statement_history_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: task_logs task_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_logs
    ADD CONSTRAINT task_logs_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_credit_packages_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_credit_packages_id ON public.credit_packages USING btree (id);


--
-- Name: ix_model_configs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_model_configs_id ON public.model_configs USING btree (id);


--
-- Name: ix_platform_settings_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_platform_settings_id ON public.platform_settings USING btree (id);


--
-- Name: ix_statement_history_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_statement_history_id ON public.statement_history USING btree (id);


--
-- Name: ix_system_logs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_system_logs_id ON public.system_logs USING btree (id);


--
-- Name: ix_task_logs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_task_logs_id ON public.task_logs USING btree (id);


--
-- Name: ix_transactions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_transactions_id ON public.transactions USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: platform_settings platform_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: statement_history statement_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statement_history
    ADD CONSTRAINT statement_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: system_logs system_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: task_logs task_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_logs
    ADD CONSTRAINT task_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

