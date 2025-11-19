<div align="center">
  <img src="readme-assets/logo-color.svg" alt="Gutenform Logo" width="400">
</div>

# Gutenform

A modern WordPress form builder plugin built with Gutenberg blocks. Create beautiful, responsive forms directly in the WordPress block editor and manage all submissions through an intuitive inbox interface.

## Features

### 🎨 Gutenberg Block-Based Forms
- **Form Block**: Create form containers with customizable settings
- **Input Block**: Text, email, and other input field types
- **Textarea Block**: Multi-line text input fields
- **Submit Block**: Customizable submit buttons
- **Customizable Skins**: Style your forms with different visual themes

### 📬 Submission Management
- **Inbox Interface**: Gmail-like inbox for managing form submissions
- **Entry Labels**: Organize submissions with custom color-coded labels
- **Status Management**: Track submissions with statuses (Inbox, Junk, Archive, Trash)
- **Form Filtering**: Filter submissions by form identifier
- **Real-time Updates**: Auto-refresh inbox every 5 seconds

### 🔌 Provider System
- **Extensible Architecture**: Plugin-based provider system for handling form submissions
- **Built-in Providers**:
  - **Email Provider**: Send form submissions via email
  - **Database Provider**: Store submissions in the database
- **Custom Providers**: Easily extend with your own providers using WordPress filters

### 🎯 Additional Features
- **Mailboxes**: Organize forms into different mailboxes
- **Entry Labels**: Color-coded labels for better organization
- **Dashboard**: Overview of form statistics and activity
- **Settings**: Comprehensive settings panel for configuration
- **Modern Admin UI**: Built with React, TypeScript, and Tailwind CSS

## Requirements

- WordPress 5.9 or higher
- PHP 7.2 or higher
- Node.js and npm (for development)

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gutenform.git
```

2. Install dependencies:
```bash
npm install
composer install
```

3. Build the plugin:
```bash
npm run build
```

4. Copy the plugin folder to your WordPress `wp-content/plugins/` directory

5. Activate the plugin through the WordPress admin panel

## Usage

### Creating a Form

1. In the WordPress block editor, search for "Form" in the block inserter
2. Add the Form block to your page
3. Configure the form settings:
   - **Form Title**: Set a title for your form
   - **Form ID**: Unique identifier for the form
   - **Mailbox**: Select which mailbox should receive submissions
   - **Providers**: Choose how submissions should be handled (Email, Database, or both)
   - **Skin**: Select a visual style for your form

4. Add form fields:
   - Add **Input** blocks for text, email, and other input types
   - Add **Textarea** blocks for multi-line text
   - Add a **Submit** block to complete your form

### Managing Submissions

1. Navigate to **Gutenform > Inbox** in the WordPress admin
2. View all form submissions in the inbox interface
3. Use filters to:
   - Filter by form identifier
   - Filter by status (Inbox, Junk, Archive, Trash)
   - Filter by labels
4. Click on any submission to view full details
5. Organize submissions with labels and status changes

### Configuring Providers

1. Go to **Gutenform > Settings > Providers**
2. Configure your Email provider settings
3. Configure your Database provider settings
4. Enable or disable providers as needed

### Managing Mailboxes

1. Navigate to **Gutenform > Settings > Mailboxes**
2. Create and manage mailboxes for organizing forms
3. Assign forms to specific mailboxes

### Managing Labels

1. Go to **Gutenform > Settings > Labels**
2. Create custom labels with colors
3. Apply labels to submissions for better organization

## Development

### Setup

```bash
# Install dependencies
npm install
composer install
```

### Development Commands

```bash
# Start development servers (admin and frontend)
npm run dev

# Start admin development server only
npm run dev:admin

# Start frontend development server only
npm run dev:frontend

# Start development with WordPress server
npm run dev:server

# Build blocks for development
npm run block:start

# Build blocks for production
npm run block:build

# Build for production
npm run build
```

### Project Structure

```
gutenform/
├── assets/              # Built assets (generated)
├── config/             # Plugin configuration
├── database/           # Database migrations and seeders
│   ├── Migrations/     # Database schema changes
│   └── Seeders/        # Database seeding files
├── includes/           # Core PHP classes
│   ├── Admin/          # Admin functionality
│   ├── Assets/         # Asset management
│   ├── Controllers/    # Business logic controllers
│   ├── Core/           # Core plugin functionality
│   ├── Models/         # Data models (Entries, Mailboxes, Providers, etc.)
│   ├── Providers/      # Form submission providers
│   └── Routes/         # API route definitions
├── src/                # Frontend source code
│   ├── admin/          # Admin React application
│   ├── blocks/         # Gutenberg blocks
│   ├── components/     # Shared React components
│   └── hooks/          # React hooks
└── views/              # PHP templates
```

## API

### REST API Endpoints

All API endpoints are prefixed with `/gutenform/v1/`

#### Entries
- `GET /entries` - Get all entries
- `GET /entries/{id}` - Get a specific entry
- `POST /entries` - Create a new entry
- `PUT /entries/{id}` - Update an entry
- `DELETE /entries/{id}` - Delete an entry

#### Mailboxes
- `GET /mailboxes` - Get all mailboxes
- `POST /mailboxes` - Create a mailbox
- `PUT /mailboxes/{id}` - Update a mailbox
- `DELETE /mailboxes/{id}` - Delete a mailbox

#### Providers
- `GET /providers` - Get all providers
- `POST /providers` - Create a provider
- `PUT /providers/{id}` - Update a provider

#### Entry Labels
- `GET /entry-labels` - Get all labels
- `POST /entry-labels` - Create a label
- `PUT /entry-labels/{id}` - Update a label
- `DELETE /entry-labels/{id}` - Delete a label

## Extending Gutenform

### Creating Custom Providers

You can create custom providers to handle form submissions in different ways:

```php
<?php

namespace YourNamespace\Providers;

use Gutenform\Providers\AbstractProvider;

class CustomProvider extends AbstractProvider {
    
    public function get_slug(): string {
        return 'custom-provider';
    }
    
    public function get_name(): string {
        return 'Custom Provider';
    }
    
    public function handle_submission( array $data, array $config ): bool {
        // Your custom submission handling logic
        return true;
    }
}
```

Then register your provider:

```php
add_filter( 'gutenform/available_providers', function( $providers ) {
    $providers[] = YourNamespace\Providers\CustomProvider::class;
    return $providers;
} );
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

GPLv2 or later

## Support

For support, please open an issue on the [GitHub repository](https://github.com/yourusername/gutenform).

## Changelog

### 1.0.0
- Initial release
- Gutenberg block-based form builder
- Inbox interface for submission management
- Email and Database providers
- Mailbox and label management
- Modern React admin interface
