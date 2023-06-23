   //webkitURL is deprecated but nevertheless
   URL = window.URL || window.webkitURL;

   var gumStream; 						//stream from getUserMedia()
   var rec; 							//Recorder.js object
   var input; 							//MediaStreamAudioSourceNode we'll be recording

   // shim for AudioContext when it's not avb. 
   var AudioContext = window.AudioContext || window.webkitAudioContext;
   var audioContext //audio context to help us record
   function startRecording() {
	 console.log("recordButton clicked");

	 /*
	   Simple constraints object, for more advanced audio features see
	   https://addpipe.com/blog/audio-constraints-getusermedia/
	 */

	 var constraints = { audio: true, video: false }

	 /*
		Disable the record button until we get a success or fail from getUserMedia() 
	*/

	 // recordButton.disabled = true;
	 // stopButton.disabled = false;
	 // pauseButton.disabled = false

	 /*
		 We're using the standard promise based getUserMedia() 
		 https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	 */

	 navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
	   console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

	   /*
		 create an audio context after getUserMedia is called
		 sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
		 the sampleRate defaults to the one set in your OS for your playback device
   
	   */
	   audioContext = new AudioContext();

	   //update the format 
	   // document.getElementById("formats").innerHTML = "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz"

	   /*  assign to gumStream for later use  */
	   gumStream = stream;

	   /* use the stream */
	   input = audioContext.createMediaStreamSource(stream);

	   /* 
		 Create the Recorder object and configure to record mono sound (1 channel)
		 Recording 2 channels  will double the file size
	   */
	   rec = new Recorder(input, { numChannels: 1 })

	   //start the recording process
	   rec.record()

	   console.log("Recording started");

	 }).catch(function (err) {
	   //enable the record button if getUserMedia() fails
	   // recordButton.disabled = false;
	   // stopButton.disabled = true;
	   // pauseButton.disabled = true
	 });
   }
   function stopRecording() {
	 console.log("stopButton clicked");

	 //disable the stop button, enable the record too allow for new recordings
	 // stopButton.disabled = true;
	 // recordButton.disabled = false;
	 // pauseButton.disabled = true;

	 //reset button just in case the recording is stopped while paused
	 // pauseButton.innerHTML="Pause";

	 //tell the recorder to stop the recording
	 rec.stop();

	 //stop microphone access
	 gumStream.getAudioTracks()[0].stop();

	 //Sending to $ajax to send it to server
	 rec.exportWAV(sendData);
	 //create the wav blob and pass it on to createDownloadLink
	 //rec.exportWAV(createDownloadLink);
   }

   function sendData(data) {
	 const form = new FormData();
	 form.append("file", data, "data.wav");
	 form.append("title", "data.wav");

	 fetch("/save-record", {
	   method: "POST",
	   body: form,
	   cache: "no-cache",
	   contentType: "multipart/form-data"
	 })
	   .then(response => response.json())
	   .then(data => {
		 // console.log(data);
		 //   var data1 = data["transcribed_by_google"];
		 var data2 = data["transcribed_by_whisper"];
		 //   var data3 = data["result_for_google_audio"];
		 // var data4 = data["result_for_open_ai_whisper"];
		 console.log(data2)
		 //   document.getElementById("recorded_data_google_audio").innerHTML= "you spoke : " + data1;
		 //   document.getElementById("result_for_google_audio").innerHTML= " : " + data3;
		 // document.getElementById("recorded_data_whisper").innerHTML = "you spoke :  " + data2;
		 // document.getElementById("result_for_open_ai_whisper").innerHTML = " : " + data4;

		 document.getElementById("recorded_data_whisper").innerHTML = data2;



	   })
	   .catch(error => {
		 console.error(error);
	   });

   }