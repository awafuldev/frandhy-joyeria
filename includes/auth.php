<?php
/**
 * Frandhy Joyería — Admin Authentication Guard
 */

if (!defined('BASE_PATH')) {
    require_once dirname(__DIR__) . '/config/config.php';
}

function is_admin_logged_in(): bool {
    return isset($_SESSION['admin_id']);
}

function admin_redirect(string $url): never {
    header("Location: " . $url);
    exit;
}

// Redirect if not logged in
if (!is_admin_logged_in()) {
    flash('error', 'Debe iniciar sesión para acceder al panel de administración.');
    admin_redirect(BASE_URL . '/admin/login.php');
}

// Check admin user status
$admin_id = (int)$_SESSION['admin_id'];
$current_admin = db_fetch_one(
    "SELECT * FROM administradores WHERE id = ? AND activo = 1 LIMIT 1",
    'i',
    [$admin_id]
);

if (!$current_admin) {
    unset($_SESSION['admin_id']);
    flash('error', 'Sesión inválida o administrador inactivo.');
    admin_redirect(BASE_URL . '/admin/login.php');
}

// CSRF check for POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        flash('error', 'Error de validación de seguridad (CSRF).');
        $referer = $_SERVER['HTTP_REFERER'] ?? BASE_URL . '/admin/dashboard.php';
        admin_redirect($referer);
    }
}
