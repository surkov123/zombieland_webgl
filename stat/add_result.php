<?php
header('Access-Control-Allow-Origin: *');
include('config.php');
$uid = $mysqli->real_escape_string($_POST['uid']);
$score = (int)$_POST['score'];
$kills = (int)$_POST['kills'];
$weapon = $mysqli->real_escape_string($_POST['weapon']);

$sql = "INSERT INTO stat (uid, score, weapon, kills) values ('$uid', $score, '$weapon', $kills)";
$mysqli->query($sql);
echo  $mysqli->insert_id;
