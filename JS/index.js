$(function () {
  $('#container').highcharts({
  title: {
    text: 'Monthly Average Temperature',
    x: -20 //center
  },
  subtitle: {
    text: 'Source: WorldClimate.com',
    x: -20
  },
  xAxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
  },
  yAxis: {
    title: {
      text: 'Temperature (°C)'
    },
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  },
  tooltip: {
    valueSuffix: '°C'
  },
  legend: {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle',
    borderWidth: 0
  },
  series: [{
    name: 'Tokyo',
    data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
  }, {
    name: 'New York',
    data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
  }, {
    name: 'Berlin',
    data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
  }, {
    name: 'London',
    data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
  }]
}); // end of highcharts function.
$('#btnAnnotate').on('click', function(e) {
  e.preventDefault();
  $("#divAnnotation").css("display", "block");
  html2canvas(document.getElementById("container"), {
    onrendered: function(c) {
      //canvas.setBackgroundImage(c.toDataURL(), canvas.renderAll.bind(canvas), {
        //backgroundImageOpacity: 0.5,
        //backgroundImageStretch: false
      //});
      document.body.appendChild(c);
    }
  });
});// end of btnAnnotate function
}); //end of page load function
let canvas = new fabric.Canvas('canvas'),
  canvasContainer = $('#canvas').get(0),
  coordinate = {},
  type = "circle",
  rect = canvasContainer.getBoundingClientRect(),
  fillColor = "rgba(0,0,0,0)",
  strokeColor = "black";
/*
	COLOR BOX
*/
$('#fillColor').spectrum({
  color: "rgba(0,0,0,0)",
  showAlpha: true,
  showInput: true,
  change: function(color) {
    fillColor = color.toRgbString();
    canvas.freeDrawingBrush.color = fillColor;
  }
});
$('#strokeColor').spectrum({
  color: "rgba(0,0,0,1)",
  showAlpha: true,
  showInput: true,
  change: function(color) {
    strokeColor = color.toRgbString();
    canvas.freeDrawingBrush.shadowColor = strokeColor;
  }
});
/**
		Brushes
*/
if (fabric.PatternBrush) {
  var vLinePatternBrush = new fabric.PatternBrush(canvas);
  vLinePatternBrush.getPatternSrc = function() {

    var patternCanvas = fabric.document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext('2d');

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.stroke();

    return patternCanvas;
  };

  var hLinePatternBrush = new fabric.PatternBrush(canvas);
  hLinePatternBrush.getPatternSrc = function() {

    var patternCanvas = fabric.document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext('2d');

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(5, 10);
    ctx.closePath();
    ctx.stroke();

    return patternCanvas;
  };

  var squarePatternBrush = new fabric.PatternBrush(canvas);
  squarePatternBrush.getPatternSrc = function() {

    var squareWidth = 10,
      squareDistance = 2;

    var patternCanvas = fabric.document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
    var ctx = patternCanvas.getContext('2d');

    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, squareWidth, squareWidth);

    return patternCanvas;
  };

  var diamondPatternBrush = new fabric.PatternBrush(canvas);
  diamondPatternBrush.getPatternSrc = function() {

    var squareWidth = 10,
      squareDistance = 5;
    var patternCanvas = fabric.document.createElement('canvas');
    var rect = new fabric.Rect({
      width: squareWidth,
      height: squareWidth,
      angle: 45,
      fill: this.color
    });

    var canvasWidth = rect.getBoundingRectWidth();

    patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
    rect.set({
      left: canvasWidth / 2,
      top: canvasWidth / 2
    });

    var ctx = patternCanvas.getContext('2d');
    rect.render(ctx);

    return patternCanvas;
  };

  var img = new Image();
  img.src = '../assets/honey_im_subtle.png';

  var texturePatternBrush = new fabric.PatternBrush(canvas);
  texturePatternBrush.source = img;
}
/**
		canvas mouse down event
   	determines CLICK POSITION x1,y1
*/
canvas.on('mouse:down', function(event) {
  let evt = event.e;
  coordinate = {
    x1: (evt.clientX - rect.left) - 7,
    y1: (evt.clientY - rect.top) - 7
  }
});
/**
		canvas mouse Up event
   	determines CLICK POSITION x2,y2 and Draw object
*/
canvas.on('mouse:up', function(event) {
  let evt = event.e;
  coordinate['x2'] = (evt.clientX - rect.left) - 7;
  coordinate['y2'] = (evt.clientY - rect.top) - 7;
  if (evt.which === 3) {
    return false;
  }
  addItem();
});
/**
	  Draw Object Access
    	type: of object
      coordinates.

*/
function addItem() {
  if (canvas.getActiveObject() !== null) {
    return false;
  }
  switch (type) {
    case "circle":
      canvas.add(new fabric.Circle({
        radius: Math.abs((coordinate.x2 - coordinate.x1) / 2),
        fill: fillColor,
        stroke: strokeColor,
        left: (coordinate.x1 > coordinate.x2 ? coordinate.x2 : coordinate.x1),
        top: (coordinate.y1 > coordinate.y2 ? coordinate.y2 : coordinate.y1)
      }));
      break;
    case "triangle":
      canvas.add(new fabric.Triangle({
        width: Math.abs(coordinate.x2 - coordinate.x1),
        height: Math.abs(coordinate.y2 - coordinate.y1),
        fill: fillColor,
        stroke: strokeColor,
        left: (coordinate.x1 > coordinate.x2 ? coordinate.x2 : coordinate.x1),
        top: (coordinate.y1 > coordinate.y2 ? coordinate.y2 : coordinate.y1)
      }));
      break;
    case "line":
      canvas.add(new fabric.Line([0, 0, Math.abs(coordinate.x2 - coordinate.x1), Math.abs(coordinate.y2 - coordinate.y1)], {
        width: Math.abs(coordinate.x2 - coordinate.x1),
        height: Math.abs(coordinate.y2 - coordinate.y1),
        fill: fillColor,
        stroke: strokeColor,
        left: (coordinate.x1 > coordinate.x2 ? coordinate.x2 : coordinate.x1),
        top: (coordinate.y1 > coordinate.y2 ? coordinate.y2 : coordinate.y1)
      }));
      break;
    case "rectangle":
      canvas.add(new fabric.Rect({
        left: (coordinate.x1 > coordinate.x2 ? coordinate.x2 : coordinate.x1),
        top: (coordinate.y1 > coordinate.y2 ? coordinate.y2 : coordinate.y1),
        fill: fillColor,
        stroke: strokeColor,
        width: Math.abs(coordinate.x2 - coordinate.x1),
        height: Math.abs(coordinate.y2 - coordinate.y1)
      }));
      break;
    case "Pencil":
      canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas);
      canvas.freeDrawingBrush.color = fillColor;
      canvas.freeDrawingBrush.shadowColor = strokeColor;
      break;
    case "hline":
      canvas.freeDrawingBrush = vLinePatternBrush;
      canvas.freeDrawingBrush.color = fillColor;
      canvas.freeDrawingBrush.shadowColor = strokeColor;
      break;
    case "vline":
      canvas.freeDrawingBrush = hLinePatternBrush;
      canvas.freeDrawingBrush.color = fillColor;
      canvas.freeDrawingBrush.shadowColor = strokeColor;
      break;
    case "square":
      canvas.freeDrawingBrush = squarePatternBrush;
      canvas.freeDrawingBrush.color = fillColor;
      canvas.freeDrawingBrush.shadowColor = strokeColor;
      break;
    case "diamond":
      canvas.freeDrawingBrush = diamondPatternBrush;
      canvas.freeDrawingBrush.color = fillColor;
      canvas.freeDrawingBrush.shadowColor = strokeColor;
      break;
    case "texture":
      canvas.freeDrawingBrush = texturePatternBrush;
      canvas.freeDrawingBrush.color = fillColor;
      canvas.freeDrawingBrush.shadowColor = strokeColor;
      break;
    default:
      alert("Select Item");
      break;
  }
}
/*
		buttons init for tools
*/
$('button[data-drawing]').on('click', function(e) {
  e.preventDefault();
  $('button').removeClass('active')
  type = $(this).addClass('active').data('type');
});
var ctxTarget = null;

var menu = [{
  name: 'Delete',
  img: '',
  title: 'Delete',
  fun: function(o, jqEvent) {
    if (ctxTarget) {
      canvas.getActiveObject().remove();
    }
  }
}, {
  name: 'Add Comment',
  img: '',
  title: 'Add Comment',
  fun: function(o, jqEvent) {
    if (ctxTarget) {
      canvas.getActiveObject();
    }
  }
}];

$('.upper-canvas').on('contextmenu', function(e) {
  e.preventDefault();
  ctxTarget = canvas.findTarget(e.originalEvent);
  if (ctxTarget) {
    canvas.setActiveObject(ctxTarget);
  }
});

$('.upper-canvas').contextMenu(menu, {
  triggerOn: 'contextmenu',
  closeOnClick: true
});
$('#freeDrawing').on('click', function() {
  if (canvas.isDrawingMode) {
    canvas.isDrawingMode = false;
    type = "circle";
    $('[data-drawing="false"]').removeAttr('disabled')
    $('[data-drawing="true"]').attr('disabled', true)
  } else {
    canvas.isDrawingMode = true;
    type = "Pencil";
    $('[data-drawing="false"]').attr('disabled', true)
    $('[data-drawing="true"]').removeAttr('disabled')
  }
});
