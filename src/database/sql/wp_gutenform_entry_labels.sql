-- 4.1. Tabelle zur Definition der Labels (Tags)
CREATE TABLE IF NOT EXISTS `wp_gutenform_entry_labels` (
    `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT DEFAULT NULL COMMENT 'Beschreibung der Label.',
    `color` VARCHAR(7) DEFAULT '#000000' COMMENT 'Hex-Code für die Farbdarstellung.',
    `date_created` DATETIME NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4.2. Tabelle zur Verknüpfung von Einträgen und Labels
CREATE TABLE IF NOT EXISTS `wp_gutenform_entry_label_rel` (
    `entry_id` BIGINT(20) UNSIGNED NOT NULL,
    `label_id` BIGINT(20) UNSIGNED NOT NULL,
    `date_applied` DATETIME NOT NULL,

    PRIMARY KEY (`entry_id`, `label_id`),
    KEY `idx_label_id` (`label_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;