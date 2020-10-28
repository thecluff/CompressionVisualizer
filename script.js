var canvas = null; // Waveform canvas
var ctx = null;
var ratio = 1;
var thr = 1;

var sig = null;
var wet = null;
var gainred = null;
var sigsz = 320;

//===================================
function init(){
  canvas = document.getElementById("waveform");
  ctx = canvas.getContext("2d");
  
  makeSig();
  compress();
  resizeWaveform();
}
init();

//===================================
function makeSig() {
  sig = [];
  var env = 0;
  var ecoef = 1 - Math.exp(-1 / (0.004 * sigsz));
  for (var i = 0; i < sigsz; i++) {
    var p = i / sigsz;
    var t =  1;
    t *= Math.sin(Math.pow(1 - p, 2) * 3.1415926);
    
    var tmp = i / sigsz;
    tmp -= 0.05;
    tmp = Math.min(1, tmp);
    tmp = Math.max(0, tmp);
    tmp = Math.pow(tmp, 0.5);
    tmp = -Math.pow(tmp, 0.5);
    t *= -Math.sin(3.1415926 * tmp);
    
    
    var tmp = i / sigsz;
    tmp -= 0.42;
    tmp = Math.min(1, tmp);
    tmp = Math.max(0, tmp);
    tmp = Math.pow(tmp, 0.25);
    tmp = Math.sin(3.1415926 * tmp);
    //var TEST = tmp;
    t *= 1 + 0.8*tmp;
    
    tmp = Math.pow(15*p, 4);
    if(tmp > 1) tmp = 0;
    
    env = Math.max(tmp, env * ecoef);
    t += env * 0.8;
    
    
    tmp = Math.sin(2*(Math.pow(i-0.5,2)+0.5));
    t += tmp * 0.02;
    
    sig.push(Math.abs(t*0.8) + 0.0000001);
    //sig.push(TEST);
  }
  
  
  wet = sig.slice();
}


//===================================
function compress(){
  var atkMS = parseFloat(document.getElementById("atk_text").value);
  var relMS = parseFloat(document.getElementById("rel_text").value);
  var threshVal = parseFloat(document.getElementById("thresh_text").value);
  var ratio = parseFloat(document.getElementById("ratio_text").value);
  var makeup = parseFloat(document.getElementById("gain_text").value);
 
  ratio = 1 - 1 / ratio;
  
  
  thr = Math.pow(10, threshVal / 20);
  wet = sig.slice();
  gainred = wet.slice();
  
  var acoef = 1 - Math.exp(-1 / (atkMS * 0.001 * sigsz));
  var rcoef = 1 - Math.exp(-1 / (relMS * 0.003 * sigsz));
  var outgain = Math.pow(10, makeup/20);
  var env = 1;  
  for(var i = 0; i < wet.length; i++){
    
    var gr = threshVal - 20 * Math.log10(wet[i]);
    gr = Math.pow(10, ratio * gr / 20);
    gr = Math.min(gr, 1);
    env += (gr - env) * (env < gr ? rcoef : acoef);    
    
    wet[i] *= env * outgain;
    gainred[i] = env;
  }
 
  drawWavform();
}


//===================================
function drawWavform(){
  var w = sig.length;
  var h = canvas.clientHeight;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;
  
  // Draw normal wavform
  ctx.beginPath();
  ctx.moveTo(0, h/2);
  
  for(var i = 0; i < sig.length; i++)
  {
    var lx = i / wet.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 2 * (1 + sig[i]));
  }
  ctx.lineTo(canvas.clientWidth, h/2);
  for(var i = sig.length - 1; i >=0; i--){
    var lx = i / wet.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 2 *(1 - sig[i]));
  }
  ctx.fillStyle = 'rgba(0,255,0,0.2)';
  ctx.fill();
  ctx.strokeStyle="green";
  ctx.stroke();
  
  // Draw compressed wavform
  ctx.beginPath();
  ctx.moveTo(0, h/2);
  
  for(var i = 0; i < sig.length; i++)
  {
    var lx = i / wet.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 2 * (1 + wet[i]));
  }
  ctx.lineTo(canvas.clientWidth, h/2);
  for(var i = sig.length - 1; i >=0; i--){
    var lx = i / wet.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 2 *(1 - wet[i]));
  }
  ctx.fillStyle = 'rgba(0,0,255,0.2)';
  ctx.fill();
  ctx.strokeStyle="blue";
  ctx.stroke();
  
  
  // Draw gain reduction wavform
  ctx.beginPath();
  ctx.moveTo(0, 0);
  
  for(var i = 0; i < sig.length; i++)
  {
    var lx = i / gainred.length * canvas.clientWidth;
    ctx.lineTo(lx, h / 4 * (1 - gainred[i]));
  }
  ctx.lineTo(canvas.clientWidth, 0);
  ctx.lineTo(0,0);
  
  ctx.fillStyle = 'rgba(255,0,0,0.2)';
  ctx.fill();
  ctx.strokeStyle='rgba(255,0,0,0.2)';
  ctx.stroke();
  
  // Draw Threshold wavform
  ctx.strokeStyle="rgba(100,100,100,0.8)";
  ctx.beginPath();
  var ty = h / 2 * (1-thr);
  ctx.moveTo(0, ty);
  ctx.lineTo(canvas.clientWidth, ty);
  ctx.stroke();
  
}

drawWavform();



//===================================
function resizeWaveform()
{
  var w = document.documentElement.clientWidth;
  var h = document.documentElement.clientHeight;
  //alert(w + " x " + h);
  
  canvas.setAttribute("width", w - 300);
  canvas.setAttribute("height", h-20);
  drawWavform();
}

window.addEventListener("resize", resizeWaveform);