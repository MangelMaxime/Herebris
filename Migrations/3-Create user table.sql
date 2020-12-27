CREATE TABLE hb."user" (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	email varchar NOT NULL,
	"password" varchar NOT NULL,
	firstname varchar(250) NOT NULL,
	surname varchar(250) NOT NULL,
	is_active bool NOT NULL DEFAULT true,
	created_at timestamptz(0) NOT NULL DEFAULT now(),
	reset_token varchar NULL,
	password_change_required bool NOT NULL DEFAULT true,
	refresh_token varchar(500) NULL,
	CONSTRAINT user_pk PRIMARY KEY (id),
	CONSTRAINT user_un_refresh_token UNIQUE (refresh_token),
	CONSTRAINT user_un_reset_token UNIQUE (reset_token),
	CONSTRAINT user_un_email UNIQUE (email)
);
CREATE INDEX user_id_idx ON hb."user" (id);
CREATE INDEX user_refresh_token_idx ON hb."user" (refresh_token);
CREATE INDEX user_reset_token_idx ON hb."user" (reset_token);

-- Column comments

COMMENT ON COLUMN hb."user".id IS 'Unique identifier for a user in our system';
COMMENT ON COLUMN hb."user".email IS 'Email of a user, the email is used to login into the application';
COMMENT ON COLUMN hb."user".is_active IS 'If false, then the user is not active and can''t login into the application';
COMMENT ON COLUMN hb."user".created_at IS 'Date of creation of the entry into our system';
COMMENT ON COLUMN hb."user".reset_token IS 'Unique token used to reset the password of a user';
COMMENT ON COLUMN hb."user".password_change_required IS 'True if the user need to change his password on next login';
COMMENT ON COLUMN hb."user".refresh_token IS 'For now unique token allowing the User to refresh its session automatically via JWT';
