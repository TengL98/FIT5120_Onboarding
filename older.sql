
DROP TABLE IF EXISTS landmarks_clean;
DROP TABLE IF EXISTS public_toilets_clean;
DROP TABLE IF EXISTS street_furniture_clean;

# # 1. landmarks_clean

CREATE TABLE landmarks_clean (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    feature_name VARCHAR(255),
    theme VARCHAR(255),
    sub_theme VARCHAR(255),
    geometry JSON NOT NULL,
    geom POINT SRID 4326 NOT NULL,
    INDEX idx_theme (theme),
    SPATIAL INDEX idx_geom (geom)
);

# 2. public_toilets_clean

CREATE TABLE public_toilets_clean (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255),
    wheelchair VARCHAR(10),
    operator VARCHAR(255),

    geometry JSON NOT NULL,

    geom POINT SRID 4326 NOT NULL,

    INDEX idx_operator (operator),
    SPATIAL INDEX idx_geom (geom)
);

# 3. street_furniture_clean
CREATE TABLE street_furniture_clean (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    asset_type VARCHAR(100),
    location_desc TEXT,
    condition_rating DECIMAL(4,2),

    geometry JSON NOT NULL,

    geom POINT SRID 4326 NOT NULL,

    INDEX idx_asset_type (asset_type),
    SPATIAL INDEX idx_geom (geom)
);


UPDATE landmarks_clean
SET geom =
ST_SRID(
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            JSON_EXTRACT(geometry, '$.coordinates[0]'),
            ' ',
            JSON_EXTRACT(geometry, '$.coordinates[1]'),
            ')'
        )
    ),
    4326
);

UPDATE public_toilets_clean
SET geom =
ST_SRID(
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            JSON_EXTRACT(geometry, '$.coordinates[0]'),
            ' ',
            JSON_EXTRACT(geometry, '$.coordinates[1]'),
            ')'
        )
    ),
    4326
);

UPDATE street_furniture_clean
SET geom =
ST_SRID(
    ST_GeomFromText(
        CONCAT(
            'POINT(',
            JSON_EXTRACT(geometry, '$.coordinates[0]'),
            ' ',
            JSON_EXTRACT(geometry, '$.coordinates[1]'),
            ')'
        )
    ),
    4326
);

