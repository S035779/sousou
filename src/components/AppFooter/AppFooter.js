import React from 'react';
import Photo from 'Assets/image/myanmaphoto.png';
import ini   from 'Utilities/config';

const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL;
const asset_path = process.env.ASSET_PATH;
let assets;
if (env === 'development') {
  assets = '';
} else if (env === 'staging' || env === 'production') {
  assets = host + asset_path + '/image';
}

class AppFooter extends React.Component {
  translate(label, isJP) {
    return isJP ? ini.translate[label].ja : ini.translate[label].en;
  }
  render() {
    const isJP = this.props.language === 'jp' ? true : false;
    const japan_name_en   = this.translate('office_japan_name_en', isJP);
    const japan_name_jp   = this.translate('office_japan_name_jp', isJP);
    const japan_address   = this.translate('office_japan_address', isJP);
    const japan_phone     = this.translate('office_japan_phone', isJP);
    const myanmar_name_en = this.translate('office_myanmar_name_en',isJP);
    const myanmar_name_jp = this.translate('office_myanmar_name_jp',isJP);
    const myanmar_address = this.translate('office_myanmar_address',isJP);
    const myanmar_phone   = this.translate('office_myanmar_phone', isJP);

    return <footer>
      <div className="lightbox" id="fl1">
      <div id="tokyo-office">
      <div className="office-left">
        <div className="office-p-wrap">
          <p className="office-name">
            {japan_name_en}<br />{japan_name_jp}</p>
          <p>{japan_address}<br />{japan_phone}</p>
        </div>
      </div>
      <div className="gmap office-right"><iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.2591488453954!2d139.7912017158203!3d35.67062048019689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188912cac49de9%3A0x95ff08ae40e377d7!2z44CSMTM1LTAwNDYg5p2x5Lqs6YO95rGf5p2x5Yy654mh5Li577yR5LiB55uu77yS4oiS77yS!5e0!3m2!1sja!2sjp!4v1511846649898/?force=lite"
        style={styles.gmap} >
      </iframe></div>
      </div>
      <div id="yangon-office">
      <div className="gmap office-left"><iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3819.00321660689!2d96.12820721559035!3d16.826196523174115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30c194ca13fff6e3%3A0x1334ced7a53c5bbc!2sHledan+Centre!5e0!3m2!1sja!2sjp!4v1473921780561/?force=lite"
        style={styles.gmap} >
      </iframe></div>
      <div className="office-right">
        <div className="office-p-wrap">
          <p className="office-name">
            {myanmar_name_en}<br />{myanmar_name_jp}</p>
          <p>{myanmar_address}<br />{myanmar_phone}</p>
          <img src={assets + Photo}/>
        </div>
      </div>
      </div>
      </div>
    </footer>;
  }
};

const styles = {
  map: {
    border: 0
    , allowFullScreen: true
    , width: '100%'
    , height: 300
    , frameBorder: 0
  },
};
export default AppFooter;
