import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions
} from "react-native";

const { width, height } = Dimensions.get(
  "window"
);

import TypingAnimation from "./Typing";

import Playback from "./Playback";
import RecordingCheck from "./RecordingCheck";

import _Gif from "./_GIF";

export default class ServiceMesseage extends Component {
  constructor(props) {
    super(props);
    this.state = { isWait: true };

    this.isUnmount = false;
  }

  componentDidMount() {
    const {
      isWait,
      _update,
      index,
      delay
    } = this.props;

    if (isWait) {
      setTimeout(() => {
        if (this.isUnmount === false) {
          _update(index);
          this.setState({ isWait: false });
        }
      }, delay);
    } else {
      if (this.isUnmount === false) {
        this.setState({ isWait: false });
      }
    }
  }

  componentWillUnmount() {
    this.isUnmount = true;
  }

  render() {
    const { isWait } = this.state;
    const {
      _isFocused,
      _isGif,
      text
    } = this.props;

    let gifFileName = "";
    if (_isGif) {
      gifFileName = text.split("**").join("");
    }

    if (isWait) {
      return (
        <View
          style={{
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 16
          }}
        >
          <TypingAnimation />
        </View>
      );
    } else {
      if (_isGif) {
        return (
          <View style={styles.box}>
            <View
              style={
                this.props.isFirst
                  ? styles.first_message
                  : styles.second_message
              }
            >
              <_Gif gifFileName={gifFileName} />
            </View>
          </View>
        );
      } else {
        return (
          <View style={styles.box}>
            <View
              style={
                this.props.isFirst
                  ? styles.first_message
                  : styles.second_message
              }
            >
              <Text
                style={[
                  {
                    fontSize: 16,
                    padding: 10
                  },
                  _isFocused
                    ? { fontWeight: "600" }
                    : {}
                ]}
              >
                {this.props.text}
              </Text>
            </View>
          </View>
        );
      }
    }
  }
}

const styles = StyleSheet.create({
  box: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flexDirection: "row",
    marginTop: 3,
    marginBottom: 3,
    marginLeft: 16
  },
  first_message: {
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: "#eaeaea",
    maxWidth: width - 150
  },
  second_message: {
    borderRadius: 15,
    backgroundColor: "#eaeaea",
    maxWidth: width - 150
  }
});
