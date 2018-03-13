
const MATCH_ATTRIBUTE =  /^data-dpr-[\d]+$/;
const IMG_TIMEOUT = 5000;
const criticalValue = false;

/**
 * @param {*} url
 * @return Promise
 * var loadImg = pingimgPromise("http://wwww.img.ong").
 * then((success)=>{  },(err)=>{})
 */
const pingimgPromise = (url) => {
    const Img = new Image();
    return new Promise((reslove, reject) => {
        Img.onload = () => {
            reslove("success")
        }
        Img.onerror = () => {
            reject(`${url} load error`)
        }
        setTimeout(() => {
            reject("timeout")
        }, IMG_TIMEOUT)
        Img.src = url
    });
};

const arrayify = (obj)=> Array.prototype.slice.call(obj)

/**
 * @param ele
 * @return {Array}
 */
const getAttributeNames = (ele) => {
    let attrs = [], matchAttrs = [];
    if (ele.getAttributeNames) {
        attrs = ele.getAttributeNames();
    } else {
        attrs = [].slice.call(ele.attributes);
    }
    for (let i=0; i<attrs.length; i++) {
        if (MATCH_ATTRIBUTE.test(attrs[i])) {
            matchAttrs.push(attrs[i])
        }
    }
    return matchAttrs;
}

const getGlobalImages = ()=>{
    const imagesArr = document.getElementsByTagName('img')
    return arrayify(imagesArr);
}

/**
 * note: as DOMElement return multiple scale
 * @param ele
 * @return [{scale:Number,src:URL}]
 */
const getDprAttr = (ele)=>{
    const attrs =  getAttributeNames(ele);
    let drs = [];
    for (let i = 0; i<attrs.length; ++i) {
        drs.push({
            scale:attrs[i].replace(/^data-dpr-/, ""),
            src:ele.getAttribute(attrs[i])
        })
    }
    return drs;
}

const getDprRatio = () => {
    if (window && window.devicePixelRatio) {
        return Math.round(window.devicePixelRatio)
    } else {
        return 1
    }
}

/**
 * @param dprs{Array} ->> [{scale:Number,src:Source_URL}]
 * @param cb{Function} param1{}
 * @return
 */
function matchDprSrc(dprs, cb) {
    const rat = getDprRatio();
    let matchDpr = dprs.filter((imgItem)=>rat === parseInt(imgItem.scale, 10)),
        positive = [],
        negative = [];
    if (!Array.isArray(dprs)) { return }
    const arr = dprs.map((imgItem)=>({subTract:imgItem.scale - rat, src:imgItem.src}));
    for (let i=0; i<arr.length; i++) {
        arr[i] >= 0 ? positive.push(arr[i])
            : negative.push(arr[i]);
    }
    matchDpr = criticalValue ? positive.sort((a,b)=>{ a=a.subTract; b=b.subTract; return a-b })
                             : negative.sort((a,b)=>{ a=a.subTract; b=b.subTract; return b-a })
    cb && cb(matchDpr[0].src)
}

/**
 * @param ele{HTMLDOMElement}
 * @return undefined
 */
const clearAttribute = (ele) => {
    const dprAttrs =  getAttributeNames(ele);
    for (let i=0; i<dprAttrs.length; i++) {
        ele.removeAttribute(dprAttrs[i])
    }
}

/**
 * @param images{Array|Object}?  HTMLImageElement
 * @param options{Object}? Object
 * @return undefined
 */
function multipleImg(images) {
    if (images) {
        if (!Array.isArray(images)){
            images = [images];
        }
        images.forEach((image) => {
            matchDprSrc(getDprAttr(image), (src) => {
                pingimgPromise(src).then(() => {
                    image.setAttribute('src', src);
                    clearAttribute(image)
                }).catch((err)=>{
                    console.error("multipleImg.js load img lose, use default src url : " + err);
                    clearAttribute(image)
                })
            });
        });
    } else {
        const globalImgs = getGlobalImages()
        multipleImg(globalImgs);
    }
}

if (window) {
    window.addEventListener('load', function() {
        window.multipleImg = multipleImg;
    });
}

export default multipleImg;