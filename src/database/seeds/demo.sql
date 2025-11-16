-- Setzt das Standard-Postfach für das gesamte Plugin
INSERT INTO `wp_gutenform_mailboxes` (`id`, `title`, `is_default`, `date_created`) VALUES
(1, 'Default Postfach', 1, NOW()),
(2, 'Premium Leads (Sales)', 0, NOW()),
(3, 'Technische Anfragen', 0, NOW());

-- Fügt einige Beispieldaten für Labels hinzu
INSERT INTO `wp_gutenform_entry_labels` (`id`, `name`, `color`, `date_created`) VALUES
(1, 'Wichtig', '#FF0000', NOW()),
(2, 'Abgeschlossen', '#00AA00', NOW()),
(3, 'Sales Lead', '#007FFF', NOW());

-- Beispiel für einen Formulareintrag (geht in das Default Postfach ID 1)
INSERT INTO `wp_gutenform_entries` (`id`, `mailbox_id`, `form_identifier`, `wp_post_id`, `data`, `ip_address`, `is_read`, `date_created`) VALUES
(101, 1, 'contact-page-sidebar', 15, '{"name":"Max Mustermann","email":"max@gutenform.de","message":"Ich hätte gerne die Pro-Version.","gdpr_consent":"true"}', '192.168.1.1', 0, NOW()),
(102, 2, 'landing-page-q2-2025', 22, '{"name":"Anna Schmidt","email":"anna@agentur.com","phone":"0123456789","budget":"10000-50000"}', '203.0.113.5', 0, NOW());

-- Verknüpft den ersten Eintrag mit dem Label "Sales Lead" (ID 3)
INSERT INTO `wp_gutenform_entry_label_rel` (`entry_id`, `label_id`, `date_applied`) VALUES
(102, 3, NOW());

-- Basis-Provider (müssten im Core-Code registriert sein, hier als Platzhalter)
INSERT INTO `wp_gutenform_providers` (`id`, `name`, `provider_type`, `settings`, `is_active`, `date_created`) VALUES
(1, 'Generischer Webhook', 'provider/webhook', '{"default_url":"https://api.example.com/webhook/default", "default_secret": "PLACEHOLDER_SECRET_1"}', 1, NOW());
