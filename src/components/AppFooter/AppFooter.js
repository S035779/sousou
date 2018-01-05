import React from 'react';
import Photo from 'Assets/image/myanmaphoto.png';

const env = process.env.NODE_ENV || 'development';
const host = process.env.TOP_URL;
const asset_path = process.env.ASSET_PATH;
let assets;
if (env === 'development') {
  assets = '';
} else if (env === 'staging' || env === 'production') {
  assets = host + asset_path + '/js';
}

class AppFooter extends React.Component {
  render() {
    const isJP = this.props.language === 'jp' ? true : false;
    const japan_name_en = isJP ? 'TOKYO OFFICE' : 'TOKYO OFFICE';
    const japan_name_jp = isJP ? '東京オフィス' : '';
    const japan_address = isJP
      ? '所在地　〒135-0046　東京都江東区牡丹1-2-2'
      : 'Address　1-2-2 Botan, Koto-ku, TOKYO';
    const japan_phone = isJP
      ? '電話　03（5875）8402' : 'Tel　03（5875）8402';
    const myanmer_name_en = isJP ? 'MYANMER OFFICE' : 'MYANMER OFFICE';
    const myanmer_name_jp = isJP ? 'ミャンマーオフィス' : '';
    const myanmer_address = isJP
      ? 'Address　#307, 3rd Floor, Hledan Center, Kamayut Tsp, YANGON'
      : 'Address　#307, 3rd Floor, Hledan Center, Kamayut Tsp, YANGON';
    const myanmer_phone = isJP
      ? 'Tel　+95(94)52102233' : 'Tel　+95(94)52102233';
    return <footer>
      <div className="lightbox" id="fl1">
      <div id="tokyo-office">
      <div className="office-left">
      <div style={{textAlign: "right"}} className="office-p-wrap">
      <p className="office-name">{japan_name_en}<br />{japan_name_jp}</p>
      <p>{japan_address}<br />{japan_phone}</p>
      </div>
      </div>
      <div className="office-right">
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.2591488453954!2d139.7912017158203!3d35.67062048019689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188912cac49de9%3A0x95ff08ae40e377d7!2z44CSMTM1LTAwNDYg5p2x5Lqs6YO95rGf5p2x5Yy654mh5Li577yR5LiB55uu77yS4oiS77yS!5e0!3m2!1sja!2sjp!4v1511846649898/?force=lite" width="100%" height="300" frameBorder="0" style={{border: 0, allowFullScreen: true}} ></iframe>
      </div>
      </div>
      <div id="yangon-office">
      <div className="office-left">
      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3819.00321660689!2d96.12820721559035!3d16.826196523174115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30c194ca13fff6e3%3A0x1334ced7a53c5bbc!2sHledan+Centre!5e0!3m2!1sja!2sjp!4v1473921780561/?force=lite" width="100%" height="300" frameBorder="0" style={{border: 0, allowFullScreen: true}} ></iframe>
      </div>
      <div className="office-right">
      <div className="office-p-wrap">
      <p className="office-name">{myanmer_name_en}<br />{myanmer_name_jp}</p>
      <p>{myanmer_address}<br />{myanmer_phone}</p>
      <img src={assets + Photo}/>
      </div>
      </div>
      </div>
      </div>
    </footer>;
  }
}
export default AppFooter;
