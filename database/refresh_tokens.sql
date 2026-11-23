-- =========================================================
-- TABLA: refresh_tokens (Tarea 4 - autenticación JWT)
-- Ejecutar sobre una base creada con "Script Hotel laureles.sql".
-- =========================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id_refresh_token INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expira_en TIMESTAMP NOT NULL,
    revocado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario
    ON refresh_tokens(id_usuario);
