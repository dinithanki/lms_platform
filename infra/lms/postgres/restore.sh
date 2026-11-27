#!/bin/sh
set -eu

databases="auth_db user_db course_db quiz_db"
for database in $databases; do
    backup="/backups/${database}-20261126-210309.dump"
    if [ ! -s "$backup" ]; then
        echo "Required backup is missing or empty: $backup" >&2
        exit 1
    fi
    pg_restore --list "$backup" >/dev/null
    tables=$(psql --no-psqlrc --tuples-only --no-align --dbname "$database" \
        --command "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')")
    if [ "$tables" -ne 0 ]; then
        echo "Refusing to restore into non-empty database: $database" >&2
        exit 1
    fi
done

for database in $databases; do
    backup="/backups/${database}-20261126-210309.dump"
    echo "Restoring $database from its read-only backup mount..."
    pg_restore --exit-on-error --no-owner --no-acl --no-tablespaces --dbname "$database" "$backup"
done

echo "All four LMS databases restored."
