<?php
define('dbhost', 'localhost'); 
define('dblogin', 'login');
define('dbpass', 'pass');
define('dbname', 'zombie');
$mysqli = new mysqli(dbhost, dblogin, dbpass, dbname);
$mysqli->set_charset("utf8");
?>
