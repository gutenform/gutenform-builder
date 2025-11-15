{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Node.js and package managers
    nodejs_20
    nodePackages.npm
    nodePackages.yarn
    
    # PHP and Composer
    php83
    php83Packages.composer
    
    # WordPress CLI tools (if available)
    # wp-cli  # Uncomment if you have wp-cli in nixpkgs
    
    # Development tools
    git
    curl
    wget
    
    # Optional: For better shell experience
    bash-completion
  ];

  # Set environment variables
  shellHook = ''
    echo "🚀 Gutenform Development Environment"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "PHP: $(php --version | head -n 1)"
    echo "Composer: $(composer --version | head -n 1)"
    echo ""
    echo "Available commands:"
    echo "  npm run dev          - Start development servers"
    echo "  npm run build         - Build for production"
    echo "  composer install     - Install PHP dependencies"
    echo ""
  '';

  # Ensure npm uses the correct Node.js version
  NODE_ENV = "development";
}

