<?php 
header('Access-Control-Allow-Origin: *');
include('config.php');
$sql = "SELECT * FROM stat WHERE 1 ORDER BY score DESC";
$result = $mysqli->query($sql);
$data = array();
while ($r = $result->fetch_assoc()) {
    //echo $actor['uid']." ".$actor['date'].' '.$actor['score'].' '.$actor['weapon']."<br/>";
    $data[] = $r;
}
echo json_encode($data);

