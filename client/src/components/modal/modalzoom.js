// displays pin zoom modal
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './modal.scss';

class PinZoom extends Component {

  constructor(props) {
    super(props);
    // initialize modal show state to false
    this.state = {
      show: false,
      firstShow: false,
      parentDivStyle: { top: 80, width: '90%' },
    };
  }

  componentDidMount() {
    window.addEventListener('click', this.outsideClick);
  }

  componentDidUpdate(prevProps) {
    const { message, zoomInfo } = this.props;
    const { parentDivStyle } = this.state;
    if ((prevProps.message === false) && (message === true)) {
      const divCopy = JSON.parse(JSON.stringify(parentDivStyle));
      divCopy.top = zoomInfo[2] + 70;
      if (prevProps.zoomInfo.length
        && prevProps.zoomInfo[0].imgDescription !== zoomInfo[0].imgDescription) {
        divCopy.width = window.innerWidth;
      }
      // add overlay class to body outside of react root app
      document.body.classList.add('overlay');
      this.setState({
        show: true,
        firstShow: true,
        parentDivStyle: divCopy,
      });
    }
    if ((prevProps.message === true) && (message === false)) {
      document.body.classList.remove('overlay');
      this.setState({
        show: false,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.outsideClick);
  }

  outsideClick = (e) => {
    const { show, firstShow } = this.state;
    const closestElement = e.target.closest('.zoom');
    if (!closestElement && firstShow) {
      this.setState({ firstShow: false });
      return;
    }
    if (!closestElement && show) this.close();
  }

  close = () => {
    // note my modified modal now sends a reset callback after closing modalstate which clears
    // the message field
    const { reset } = this.props;
    document.body.classList.remove('overlay');
    this.setState({
      show: false,
    }, () => reset());
  }

  getNewImageWidth = (imgDim) => {
    const { naturalWidth: width, naturalHeight: height } = imgDim;
    let { innerWidth, innerHeight } = window;
    // parameter for innerwidth/height adjustment with mobile consideration
    // top(70) + headingheight(50 / 25) + button height (50 / 25)
    innerHeight = innerHeight < 500 ? innerHeight - 120 : innerHeight - 170;
    // minor width adjustment for padding too
    innerWidth -= (innerWidth * 0.02);
    const aspectRatio = width / height;
    let newWidth;
    // already fits just return value
    if (width < innerWidth && height < innerHeight) {
      newWidth = width < 500 && innerWidth > 500 ? 500 : width;
    } else if (width > innerWidth) {
      newWidth = innerWidth;
      // test new height with Aspect ratio
      const newHeight = newWidth / aspectRatio;
      // test again if new height is less than screen height
      newWidth = newHeight < innerHeight
        ? newWidth
        : aspectRatio * innerHeight;
    } else { // means height > innerheight
      newWidth = aspectRatio * innerHeight;
    }
    // send also reduction size for fontsizing
    return newWidth;
  }

  handleImage = (i) => {
    const { naturalWidth, naturalHeight } = i.target;
    const { parentDivStyle } = this.state;
    const newWidth = this.getNewImageWidth({ naturalWidth, naturalHeight });
    const pcopy = JSON.parse(JSON.stringify(parentDivStyle));
    pcopy.width = `${newWidth}px`;
    pcopy.small = newWidth < 350;
    this.setState({
      parentDivStyle: pcopy,
    });
  }

  pinners = pinInformation => (pinInformation.savedBy.length > 3
    ? `${pinInformation.savedBy.slice(0, 2).join(', ')} and ${pinInformation.savedBy.length - 3} others`
    : pinInformation.savedBy.join(', '))

  render() {
    // use total pins to display how many have saved image
    // components brings in as prop zoominfo etire object containing pin information
    const { zoomInfo } = this.props;
    const { show, parentDivStyle } = this.state;
    if (!zoomInfo.length) return null;
    const pinInformation = zoomInfo[0];
    const buttonInformation = zoomInfo[1];
    const totalPins = (pinInformation.savedBy) ? pinInformation.savedBy.length : 0;
    const pinnedBy = totalPins ? this.pinners(pinInformation) : '';
    return (
      <div
        className={show ? 'zoom cshow' : 'zoom chide'}
        style={parentDivStyle}
      >
        <div className="header">
          <span id="zoomtitle">
            <div id="zoomdesc">{pinInformation.imgDescription}</div>
            <div id="zoomowner">{`Linked By: ${pinInformation.owner}`}</div>
          </span>
          <span id="zoomtack" title={pinnedBy} className={parentDivStyle.small ? 'small' : ''}>
            <i className="fa fa-thumb-tack" aria-hidden="true" />
            {`  ${totalPins}`}
          </span>
          <i className="fa fa-close" onClick={this.close} aria-hidden="true" />
        </div>

        <img
          alt=""
          className="pinzoom"
          src={pinInformation.imgLink}
          onLoad={this.handleImage}
        />

        <div className="footer">
          {buttonInformation}
        </div>
      </div>
    );
  }

}

export default PinZoom;


PinZoom.propTypes = {
  message: PropTypes.bool.isRequired,
  zoomInfo: PropTypes.arrayOf(PropTypes.any).isRequired,
  reset: PropTypes.func.isRequired,
};
