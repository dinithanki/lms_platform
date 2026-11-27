SELECT format('CREATE DATABASE %I OWNER %I', 'auth_db', current_user) \gexec
SELECT format('CREATE DATABASE %I OWNER %I', 'user_db', current_user) \gexec
SELECT format('CREATE DATABASE %I OWNER %I', 'course_db', current_user) \gexec
SELECT format('CREATE DATABASE %I OWNER %I', 'quiz_db', current_user) \gexec
