-- Alter the table "ia_prompt"
ALTER TABLE ia_prompt
  ADD COLUMN is_latest boolean DEFAULT false;
  
ALTER TABLE ia_prompt
  ADD COLUMN share varchar(32) DEFAULT 'PRIVADO';
  
-- Change the column "kind" to be VARCHAR(32). If needed, use USING to cast.
ALTER TABLE ia_prompt
  ALTER COLUMN kind TYPE varchar(32)
  USING kind::varchar(32);

-- Create an index on (is_latest, base_id, id)
CREATE INDEX latest ON ia_prompt (is_latest, base_id, id);


-- Alter the table "ia_generation"
ALTER TABLE ia_generation
  ADD COLUMN created_by integer;


-- Create the table "ia_favorite"
CREATE TABLE ia_favorite (
  id SERIAL PRIMARY KEY,
  user_id integer NOT NULL,
  prompt_id integer NOT NULL,
  level integer DEFAULT 1,
  CONSTRAINT favorite_user_id FOREIGN KEY (user_id)
    REFERENCES ia_user (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT favorite_prompt_id FOREIGN KEY (prompt_id)
    REFERENCES ia_prompt (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

-- Create an additional index on user_id
CREATE INDEX favorite_user_id_idx ON ia_favorite (user_id);
