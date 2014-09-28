$(document).ready(function() {
  $('#joinButton').click(function() {
    $('#joinArea').hide();
    $('#gameArea').css("visibility", "visible");
    $('#gameArea').show();
  });
});