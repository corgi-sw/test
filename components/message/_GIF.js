import React, { Component } from "react";
import { View, Image } from "react-native";

import ServerURL from "../../utility/ServerURL";

export default class _GIF extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _calSize(org_width, org_height) {
    const { _maxWidth } = this.props;

    img_height = 0;
    ratio = org_width / _maxWidth;
    img_height = org_height / ratio;

    return img_height;
  }

  render() {
    const { gif, _maxWidth } = this.props;
    const obj = gif.file;
    const org_width = gif.width;
    const org_height = gif.height;
    const img_width = _maxWidth;
    const img_height = this._calSize(
      org_width,
      org_height
    );

    return (
      <View
        style={{
          width: img_width + 20,
          height: img_height + 20,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Image
          source={{ uri: ServerURL + obj }}
          style={{
            width: img_width,
            height: img_height
          }}
          resizeMode={"contain"}
        ></Image>
      </View>
    );
  }
}
