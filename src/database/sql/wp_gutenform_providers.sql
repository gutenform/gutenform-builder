CREATE TABLE IF NOT EXISTS `wp_gutenform_providers` (
    `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `provider_type` VARCHAR(50) NOT NULL COMMENT 'Interner Slug des Providers (z.B. db, email).',
    `settings` LONGTEXT NOT NULL COMMENT 'Verschlüsselte Konfigurationsdaten (JSON).',
    `is_active` TINYINT(1) DEFAULT 1,
    `date_created` DATETIME NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_provider_type` (`provider_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;