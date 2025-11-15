CREATE TABLE IF NOT EXISTS `wp_gutenform_mailboxes` (
    `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `is_default` TINYINT(1) DEFAULT 0 COMMENT 'Markiert das Standard-Postfach (1) für die Free-Version.',
    `date_created` DATETIME NOT NULL,
    `user_id` BIGINT(20) UNSIGNED DEFAULT NULL,

    PRIMARY KEY (`id`),
    KEY `idx_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;