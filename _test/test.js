$(document).ready(function() { 
    $("table").tablesorter(); 
    $("#append").click(function() { 
        // add some html 
        var html = "<tr><td>Peter</td><td>Parker</td><td>28</td><td>$9.99</td><td>20%</td><td>Jul 6, 2006 8:14 AM</td></tr>"; 
        html += "<tr><td>John</td><td>Hood</td><td>33</td><td>$19.99</td><td>25%</td><td>Dec 10, 2002 5:14 AM</td></tr><tr><td>Clark</td><td>Kent</td><td>18</td><td>$15.89</td><td>44%</td><td>Jan 12, 2003 11:14 AM</td></tr>";         
        html += "<tr><td>Bruce</td><td>Almighty</td><td>45</td><td>$153.19</td><td>44%</td><td>Jan 18, 2001 9:12 AM</td></tr>"; 
        // append new html to table body  
         $("table tbody").append(html); 
        // let the plugin know that we made a update 
        $("table").trigger("update"); 
    }); 
});