------------  DB OWNER ROLE ------------
DO
$body$
BEGIN
  IF NOT EXISTS (
    SELECT    *
    FROM   pg_catalog.pg_roles
    WHERE  rolname = 'graphile_starter')
  THEN
    CREATE ROLE graphile_starter;
  END IF;

  ALTER ROLE graphile_starter with LOGIN;
  ALTER ROLE graphile_starter with CREATEDB;

END
$body$;
--||--
---------- END DB OWNER ROLE -----------
  

---------- DB USER ROLES -----------

    ------------ graphile_starter_visitor
      DO
      $body$
      BEGIN
        IF NOT EXISTS (
          SELECT    *
          FROM   pg_catalog.pg_roles
          WHERE  rolname = 'graphile_starter_visitor'
        ) THEN
          CREATE ROLE graphile_starter_visitor;
        END IF;

        ALTER ROLE graphile_starter_visitor with NOLOGIN;
        

      END
      $body$;
      --||--
    -------- END graphile_starter_visitor

---------- END USER ROLES ----------



------------  DB AUTHENTICATOR ROLE ------------
DO
$body$
BEGIN
  IF NOT EXISTS (
    SELECT    *
    FROM   pg_catalog.pg_roles
    WHERE  rolname = 'graphile_starter_authenticator')
  THEN
    CREATE ROLE graphile_starter_authenticator;
  END IF;

ALTER ROLE graphile_starter_authenticator with LOGIN;
ALTER ROLE graphile_starter_authenticator with NOINHERIT;

GRANT graphile_starter_visitor TO graphile_starter_authenticator;

END
$body$;
--||--
---------- END DB AUTHENTICATOR ROLE -----------
  

----------
----------  END POSTGRES ROLES SQL
----------
--==
