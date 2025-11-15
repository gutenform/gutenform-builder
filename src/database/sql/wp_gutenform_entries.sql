CREATE TABLE IF NOT EXISTS `wp_gutenform_entries` (
    `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `mailbox_id` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Referenziert das Postfach aus wp_gutenform_mailboxes.',
    `form_identifier` VARCHAR(100) DEFAULT NULL COMMENT 'Vom Nutzer definierter Slug des Formulars (z.B. landing-page-v2).',
    `wp_post_id` BIGINT(20) UNSIGNED DEFAULT NULL COMMENT 'Die ID der WP-Seite, von der das Formular abgeschickt wurde.',
    `data` LONGTEXT NOT NULL COMMENT 'Alle Feldwerte als JSON-String.',
    `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP-Adresse des Absenders (oder anonymisiert).',
    `is_read` TINYINT(1) DEFAULT 0 COMMENT 'Status: 0=Ungelesen, 1=Gelesen.',
    `date_created` DATETIME NOT NULL,

    PRIMARY KEY (`id`),
    KEY `idx_mailbox_id` (`mailbox_id`),
    KEY `idx_wp_post_id` (`wp_post_id`),
    KEY `idx_identifier` (`form_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;