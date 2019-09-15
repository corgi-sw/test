import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from "react-native";

import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Font from "expo-font";
import * as Permissions from "expo-permissions";

class Icon {
  constructor(module, width, height) {
    this.module = module;
    this.width = width;
    this.height = height;
    Asset.fromModule(this.module).downloadAsync();
  }
}

const ICON_RECORD_BUTTON = new Icon(
  require("../../assets/images/record_button.png"),
  70,
  119
);
const ICON_RECORDING = new Icon(
  require("../../assets/images/record_icon.png"),
  20,
  14
);

const {
  width: DEVICE_WIDTH,
  height: DEVICE_HEIGHT
} = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFFFFF";
const DISABLED_OPACITY = 0.5;
const RATE_SCALE = 3.0;

import ServerURL from "../../utility/ServerURL";
import axios from "axios";

export default class Recording extends React.Component {
  constructor(props) {
    super(props);
    this.recording = null;
    this.sound = null;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.state = {
      haveRecordingPermissions: false,
      isLoading: false,
      muted: false,
      recordingDuration: null,
      isRecording: false,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0
    };
    this.recordingSettings = JSON.parse(
      JSON.stringify(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      )
    );
    // // UNCOMMENT THIS TO TEST maxFileSize:
    // this.recordingSettings.android['maxFileSize'] = 12000;
  }

  componentDidMount() {
    setTimeout(() => {
      this.props._scrollToEnd();
    }, 150);

    (async () => {
      await Font.loadAsync({
        "cutive-mono-regular": require("../../assets/fonts/CutiveMono-Regular.ttf")
      });
      this.setState({ fontLoaded: true });
    })();
    this._askForPermissions();
  }

  _askForPermissions = async () => {
    const response = await Permissions.askAsync(
      Permissions.AUDIO_RECORDING
    );
    this.setState({
      haveRecordingPermissions:
        response.status === "granted"
    });
  };

  _updateScreenForRecordingStatus = status => {
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis
      });
      if (!this.state.isLoading) {
        this._stopRecordingAndEnablePlayback();
      }
    }
  };

  async _stopPlaybackAndBeginRecording() {
    this.setState({
      isLoading: true
    });
    if (this.sound !== null) {
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS:
        Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid:
        Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true
    });
    if (this.recording !== null) {
      this.recording.setOnRecordingStatusUpdate(
        null
      );
      this.recording = null;
    }

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      this.recordingSettings
    );
    recording.setOnRecordingStatusUpdate(
      this._updateScreenForRecordingStatus
    );

    this.recording = recording;
    await this.recording.startAsync(); // Will call this._updateScreenForRecordingStatus to update the screen.
    this.setState({
      isLoading: false
    });
  }

  async _stopRecordingAndEnablePlayback() {
    this.setState({
      isLoading: true
    });
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
    const info = await FileSystem.getInfoAsync(
      this.recording.getURI()
    );

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS:
        Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid:
        Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true
    });
    const {
      sound,
      status
    } = await this.recording.createNewLoadedSoundAsync(
      {
        isLooping: true,
        isMuted: this.state.muted,
        volume: this.state.volume,
        rate: this.state.rate,
        shouldCorrectPitch: this.state
          .shouldCorrectPitch
      }
    );

    const fileName = await this._saveRecording(
      info.uri,
      status
    );

    this.setState({
      isLoading: false
    });

    if (fileName != null) {
      this.props._record(fileName);
    }
  }

  _toDateString(date) {
    const s =
      date.getFullYear() +
      "" +
      this._pad(date.getMonth() + 1, 2) +
      "" +
      this._pad(date.getDate(), 2) +
      "-" +
      this._pad(date.getHours(), 2) +
      "" +
      this._pad(date.getMinutes(), 2) +
      "" +
      this._pad(date.getSeconds(), 2);
    return s;
  }
  _pad(n, width) {
    n = n + "";
    return n.length >= width
      ? n
      : new Array(width - n.length + 1).join(
          "0"
        ) + n;
  }

  _saveRecording = async (file, status) => {
    const data = new FormData();
    const cleanFile = file.replace("file://", "");

    const fileName = this._toDateString(
      new Date()
    );

    let extString = ".caf";

    data.append("audio", {
      name: fileName + extString,
      uri: cleanFile
    });

    data.append("fileName", fileName);
    data.append(
      "fileTime",
      this._getMMSSFromMillis(
        status.durationMillis
      )
    );

    try {
      await axios.post(ServerURL + "save", data, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data"
        }
      });

      return fileName + extString;
    } catch (error) {
      console.log("error");

      return null;
    }
  };

  _onRecordPressed = () => {
    if (this.state.isRecording) {
      this._stopRecordingAndEnablePlayback();
    } else {
      this._stopPlaybackAndBeginRecording();
    }
  };

  _getMMSSFromMillis(millis) {
    const totalSeconds = millis / 1000;
    const seconds = Math.floor(totalSeconds % 60);
    const minutes = Math.floor(totalSeconds / 60);

    const padWithZero = number => {
      const string = number.toString();
      if (number < 10) {
        return "0" + string;
      }
      return string;
    };
    return (
      padWithZero(minutes) +
      ":" +
      padWithZero(seconds)
    );
  }

  _getRecordingTimestamp() {
    if (this.state.recordingDuration != null) {
      return `${this._getMMSSFromMillis(
        this.state.recordingDuration
      )}`;
    }
    return `${this._getMMSSFromMillis(0)}`;
  }

  render() {
    const h = 180;

    if (!this.state.fontLoaded) {
      return <View style={{ height: h }} />;
    }

    if (!this.state.haveRecordingPermissions) {
      return (
        <View style={styles.container}>
          <View />
          <Text
            style={
              ([
                styles.noPermissionsText,
                {
                  fontFamily:
                    "cutive-mono-regular"
                }
              ],
              { height: h })
            }
          >
            You must enable audio recording
            permissions in order to use this app.
          </Text>
          <View />
        </View>
      );
    }

    return (
      <View
        style={{
          height: h
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <TouchableHighlight
            underlayColor={BACKGROUND_COLOR}
            onPress={this._onRecordPressed}
            disabled={this.state.isLoading}
          >
            <Image
              style={styles.image}
              source={ICON_RECORD_BUTTON.module}
            />
          </TouchableHighlight>
          <Text
            style={[
              {
                fontFamily: "cutive-mono-regular",
                fontSize: 16
              }
            ]}
          >
            {this._getRecordingTimestamp()}
          </Text>

          {this.state.isRecording ? (
            <View
              style={{
                height: 40,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Image
                style={[
                  styles.image,
                  {
                    opacity: this.state
                      .isRecording
                      ? 1.0
                      : 0.0
                  }
                ]}
                source={ICON_RECORDING.module}
              />
              <Text
                style={[
                  {
                    fontFamily:
                      "cutive-mono-regular",
                    margin: 10,
                    fontSize: 20
                  }
                ]}
              >
                {this.state.isRecording
                  ? "LIVE"
                  : ""}
              </Text>
            </View>
          ) : (
            <View />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignSelf: "stretch",
    backgroundColor: BACKGROUND_COLOR
  },
  noPermissionsText: {
    textAlign: "center"
  }
});
