class VideoDeviceManager {
  // helper class to enumerate video devices and make them available for use.
  // usage: let v = await new VideoDeviceManager();

  constructor() {
    return (async () => {
      if (this.requestPermissionForDevices()) {
        this.hasPermission = true;
        this._videoDevices = await this.enumerateVideoDevices();
        return this;
      }
    })();
  }
  
  set videoDevicesSelectList(targetId) {
     this._videoDevicesSelectList = document.getElementById(targetId); 
  }
    
  get videoDevicesSelectList() {
     return this._videoDevicesSelectList; 
  }
  
  get selectedVideoDevice() {
     return this.videoDevices.find((d) => d.deviceId == this.videoDevicesSelectList.value) 
  }

  get videoDevices() {
    return this._videoDevices;
  }

  videoDevicesAsOptions(targetId = "video-devices-list") {
    // updates a select list to show each video device as an option
    // the returns the currently selected (first) option

    // let devicesSelectList = document.getElementById(targetId);
    
    this.videoDevicesSelectList = targetId;

    // empty out the list
    for (const c of this.videoDevicesSelectList.childNodes) {
      this.videoDevicesSelectList.removeChild(this.videoDevicesSelectList.firstChild);
    }

    this.videoDevices.map((d) => {
      let option = document.createElement("option");
      option.value = d.deviceId;
      option.innerText = d.label;
      this.videoDevicesSelectList.appendChild(option);
    });
    return this.selectedVideoDevice;
  }

  async requestPermissionForDevices() {
    // request permission to use webcam
    await navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        const tracks = mediaStream.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
        return true;
      })
      .catch((err) => {
        if (err.name === "NotAllowedError") {
          alert("You need to grant permission to use your webcam");
        } else {
          console.log(`${err.name}: ${err.message}`);
        }
        return false;
      });
  }

  async enumerateVideoDevices() {
    return (
      await navigator.mediaDevices.enumerateDevices({
        video: true,
      })
    ).filter((d) => d.kind == "videoinput");
  }
}
