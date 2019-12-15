/*
 * $Id: gnuplot_svg.js,v 1.17 2014/05/26 21:59:41 sfeam Exp $
 */
// Javascript routines for interaction with SVG documents produced by 
// gnuplot's SVG terminal driver.

var gnuplot_svg = { };

gnuplot_svg.version = "26 May 2014";

gnuplot_svg.SVGDoc = null;
gnuplot_svg.SVGRoot = null;

gnuplot_svg.Init = function(e)
{
   gnuplot_svg.SVGDoc = e.target.ownerDocument;
   gnuplot_svg.SVGRoot = gnuplot_svg.SVGDoc.documentElement;
   gnuplot_svg.axisdate = new Date();
}

gnuplot_svg.toggleVisibility = function(evt, targetId)
{
   var newTarget = evt.target;
   if (targetId)
      newTarget = gnuplot_svg.SVGDoc.getElementById(targetId);

   var newValue = newTarget.getAttributeNS(null, 'visibility')

   if ('hidden' != newValue)
      newValue = 'hidden';
   else
      newValue = 'visible';

   newTarget.setAttributeNS(null, 'visibility', newValue);

   if (targetId) {
      newTarget = gnuplot_svg.SVGDoc.getElementById(targetId.concat("_keyentry"));
      if (newTarget)
         newTarget.setAttributeNS(null, 'style',
		newValue == 'hidden' ? 'filter:url(#greybox)' : 'none');
   }

   evt.preventDefault();
   evt.stopPropagation();
}

gnuplot_svg.toggleGrid = function() {
    if (!gnuplot_svg.SVGDoc.getElementsByClassName) // Old browsers
	return;
    var grid = gnuplot_svg.SVGDoc.getElementsByClassName('gridline');
    for (var i=0; i<grid.length; i++) {
	var state = grid[i].getAttribute('visibility');
	grid[i].setAttribute('visibility', (state == 'hidden') ? 'visible' : 'hidden');
    }
}

gnuplot_svg.showHypertext = function(evt, mouseovertext)
{
    var anchor_x = evt.clientX;
    var anchor_y = evt.clientY;
    // Allow for scrollbar position (Firefox, others?)
    if (typeof evt.pageX != 'undefined') {
        anchor_x = evt.pageX; anchor_y = evt.pageY; 
    }
    var hypertextbox = document.getElementById("hypertextbox")
    hypertextbox.setAttributeNS(null,"x",anchor_x+10);
    hypertextbox.setAttributeNS(null,"y",anchor_y+4);
    hypertextbox.setAttributeNS(null,"visibility","visible");

    var hypertext = document.getElementById("hypertext")
    hypertext.setAttributeNS(null,"x",anchor_x+14);
    hypertext.setAttributeNS(null,"y",anchor_y+18);
    hypertext.setAttributeNS(null,"visibility","visible");

    var lines = mouseovertext.split('\n');
    var height = 2+16*lines.length;
    hypertextbox.setAttributeNS(null,"height",height);
    var length = hypertext.getComputedTextLength();
    hypertextbox.setAttributeNS(null,"width",length+8);

    // bounce off frame bottom
    if (anchor_y > gnuplot_svg.plot_ybot + 16 - height) {
	anchor_y -= height;
	hypertextbox.setAttributeNS(null,"y",anchor_y+4);
	hypertext.setAttributeNS(null,"y",anchor_y+18);
    }

    while (null != hypertext.firstChild) {
        hypertext.removeChild(hypertext.firstChild);
    }

    var textNode = document.createTextNode(lines[0]);

    if (lines.length <= 1) {
	hypertext.appendChild(textNode);
    } else {
	xmlns="http://www.w3.org/2000/svg";
	var tspan_element = document.createElementNS(xmlns, "tspan");
	tspan_element.appendChild(textNode);
	hypertext.appendChild(tspan_element);
	length = tspan_element.getComputedTextLength();
	var ll = length;

	for (var l=1; l<lines.length; l++) {
	    var tspan_element = document.createElementNS(xmlns, "tspan");
	    tspan_element.setAttributeNS(null,"dy", 16);
	    textNode = document.createTextNode(lines[l]);
	    tspan_element.appendChild(textNode);
	    hypertext.appendChild(tspan_element);

	    ll = tspan_element.getComputedTextLength();
	    if (length < ll) length = ll;
	}
	hypertextbox.setAttributeNS(null,"width",length+8);
    }

    // bounce off right edge
    if (anchor_x > gnuplot_svg.plot_xmax + 14 - length) {
	anchor_x -= length;
	hypertextbox.setAttributeNS(null,"x",anchor_x+10);
	hypertext.setAttributeNS(null,"x",anchor_x+14);
    }

    // left-justify multiline text
    var tspan_element = hypertext.firstChild;
    while (tspan_element) {
	tspan_element.setAttributeNS(null,"x",anchor_x+14);
	tspan_element = tspan_element.nextElementSibling;
    }

}

gnuplot_svg.hideHypertext = function ()
{
    var hypertextbox = document.getElementById("hypertextbox")
    var hypertext = document.getElementById("hypertext")
    hypertextbox.setAttributeNS(null,"visibility","hidden");
    hypertext.setAttributeNS(null,"visibility","hidden");
}

gnuplot_svg.convert_to_DMS = function (x)
{
    var dms = {d:0, m:0, s:0};
    var deg = Math.abs(x);
    dms.d = Math.floor(deg);
    dms.m = Math.floor((deg - dms.d) * 60.);
    dms.s = Math.floor((deg - dms.d) * 3600. - dms.m * 60.);
    fmt = ((x<0)?"-":" ")
        + dms.d.toFixed(0) + "°"
	+ dms.m.toFixed(0) + "\""
	+ dms.s.toFixed(0) + "'";
    return fmt;
}
