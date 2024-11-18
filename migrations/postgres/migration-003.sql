/* set schema 'apoia' */;

-- SQLINES FOR EVALUATION USE ONLY (14 DAYS)
INSERT INTO ia_model(NAME, created_at) VALUES 
    ('llama-3.2-90b-text-preview','2024-10-22 14:30:21');

ALTER TABLE ia_document 
ADD COLUMN assigned_category VARCHAR(64) NULL DEFAULT NULL,
ADD COLUMN predicted_category VARCHAR(64) NULL DEFAULT NULL,
ALTER COLUMN code TYPE VARCHAR(64);
