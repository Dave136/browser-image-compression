import fs from 'fs';
import path from 'path';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import imageCompression from '../lib';
import BROWSER_NAME from '../lib/config/browser-name';
import MAX_CANVAS_SIZE from '../lib/config/max-canvas-size';

const {
  drawImageInCanvas, getDataUrlFromFile, getFilefromDataUrl, loadImage, getExifOrientation, drawFileInCanvas,
} = imageCompression;

const IMAGE_DIR = './example';
const JPG_NAME = '178440.jpg';
const JPG_PATH = path.join(IMAGE_DIR, JPG_NAME);
const JPG_FILE = fs.readFileSync(JPG_PATH);
const PNG_NAME = 'sonic.png';
const PNG_PATH = path.join(IMAGE_DIR, PNG_NAME);
const PNG_FILE = fs.readFileSync(PNG_PATH);
const base64String = `data:image/jpeg;base64,${Buffer.from(JPG_FILE).toString('base64')}`;
const base64String2 = `data:image/png;base64,${Buffer.from(PNG_FILE).toString('base64')}`;

chai.use(chaiAsPromised);

describe('Tests', function () {
  this.timeout(30000);

  const navigator = global.navigator;

  beforeEach(() => {
    global.navigator = navigator;
    imageCompression.getBrowserName.cachedResult = undefined;
  });

  it('get File from jpg base64', async () => {
    const file = await getFilefromDataUrl(base64String, JPG_PATH);
    expect(file.type).to.equal('image/jpeg');
    expect(file.size).to.equal(2001612);
    expect(file).to.be.an.instanceof(Blob);
  });

  it('get base64 from jpg file', async () => {
    const file = new File([JPG_FILE], JPG_NAME, { type: 'image/jpeg' });
    const base64 = await getDataUrlFromFile(file);
    expect(base64).to.equal(base64String);
  });

  it('get File from png base64', async () => {
    const file = await getFilefromDataUrl(base64String2, PNG_PATH);
    expect(file.type).to.equal('image/png');
    expect(file.size).to.equal(2304210);
    expect(file).to.be.an.instanceof(Blob);
  });

  it('get base64 from png file', async () => {
    const file = new File([PNG_FILE], PNG_NAME, { type: 'image/png' });
    const base64 = await getDataUrlFromFile(file);
    expect(base64).to.equal(base64String2);
  });

  it('load image', async () => {
    const img = await loadImage(base64String);
    expect(img).to.be.an.instanceof(Image);
    expect(img.src).to.equal(base64String);
  });

  it('draw image in canvas', async () => {
    const img = await loadImage(base64String);
    const canvas = await drawImageInCanvas(img);
    expect(canvas).to.be.an.instanceof(HTMLCanvasElement);
    expect(canvas.width).to.be.a('number');
    expect(canvas.height).to.be.a('number');
    expect(canvas.getContext).to.be.a('function');
  });

  it('draw file in canvas', async () => {
    const file = new File([JPG_FILE], JPG_NAME, { type: 'image/jpeg' });

    const [img, canvas] = await drawFileInCanvas(file);
    // expect(img).to.satisfy((c) => c instanceof HTMLImageElement || c instanceof ImageBitmap)
    expect(img).to.be.an.instanceof(HTMLImageElement);
    expect(canvas).to.be.an.instanceof(HTMLCanvasElement);
    expect(canvas.width).to.be.a('number');
    expect(canvas.height).to.be.a('number');
    expect(canvas.getContext).to.be.a('function');
  });

  it('compress jpg image file', async () => {
    const file = new File([JPG_FILE], JPG_NAME, { type: 'image/jpeg' });

    const maxSizeMB = 1;
    const maxSizeByte = maxSizeMB * 1024 * 1024;

    const compressedFile = await imageCompression(file, { maxSizeMB, useWebWorker: false, exifOrientation: -2 });
    expect(compressedFile.size).to.be.at.most(maxSizeByte);
  });

  it('resize jpg image file', async () => {
    const file = new File([JPG_FILE], JPG_NAME, { type: 'image/jpeg' });

    const maxWidthOrHeight = 720;

    const compressedFile = await imageCompression(file, { maxWidthOrHeight, useWebWorker: false, exifOrientation: -2 });

    const temp = await drawFileInCanvas(compressedFile);
    const img = temp[0];
    expect(img.width).to.be.at.most(maxWidthOrHeight);
    expect(img.height).to.be.at.most(maxWidthOrHeight);
  });

  it('compress and resize jpg image file', async () => {
    const file = new File([JPG_FILE], JPG_NAME, { type: 'image/jpeg' });

    const maxSizeMB = 1;
    const maxSizeByte = maxSizeMB * 1024 * 1024;
    const maxWidthOrHeight = 720;

    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: false,
      exifOrientation: -2,
    });

    expect(compressedFile.size).to.be.at.most(maxSizeByte);

    const temp = await drawFileInCanvas(compressedFile);
    const img = temp[0];
    expect(img.width).to.be.at.most(maxWidthOrHeight);
    expect(img.height).to.be.at.most(maxWidthOrHeight);
  });

  it('compress png image file', async () => {
    const file = new File([PNG_FILE], PNG_NAME, { type: 'image/png' });

    const maxSizeMB = 1;
    const maxSizeByte = maxSizeMB * 1024 * 1024;

    const compressedFile = await imageCompression(file, { maxSizeMB, useWebWorker: false, exifOrientation: -2 });
    expect(compressedFile.size).to.be.at.most(maxSizeByte);
  });

  it('resize png image file', async () => {
    const file = new File([PNG_FILE], PNG_NAME, { type: 'image/png' });

    const maxWidthOrHeight = 720;

    const compressedFile = await imageCompression(file, { maxWidthOrHeight, useWebWorker: false, exifOrientation: -2 });

    const temp = await drawFileInCanvas(compressedFile);

    const img = temp[0];
    expect(img.width).to.be.at.most(maxWidthOrHeight);
    expect(img.height).to.be.at.most(maxWidthOrHeight);
  });

  it('compress and resize png image file', async () => {
    const file = new File([PNG_FILE], PNG_NAME, { type: 'image/png' });

    const maxSizeMB = 1;
    const maxSizeByte = maxSizeMB * 1024 * 1024;
    const maxWidthOrHeight = 720;

    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: false,
      exifOrientation: -2,
    });

    expect(compressedFile.size).to.be.at.most(maxSizeByte);

    const temp = await drawFileInCanvas(compressedFile);

    const img = temp[0];
    expect(img.width).to.be.at.most(maxWidthOrHeight);
    expect(img.height).to.be.at.most(maxWidthOrHeight);
  });

  it('fails if wrong file provided', async () => {
    const file = undefined;

    const maxSizeMB = 1;
    return expect(imageCompression(file, {
      maxSizeMB,
      useWebWorker: false,
    })).to.eventually.rejectedWith(/not an instance of/);
  });

  it('fails if wrong file provided 2', async () => {
    const file = { type: '' };

    const maxSizeMB = 1;
    return expect(imageCompression(file, {
      maxSizeMB,
      useWebWorker: false,
    })).to.eventually.rejectedWith(/not an instance of/);
  });

  it('fails if wrong file type provided', async () => {
    const file = new File(['What is the meaning of life the universe and everything?'], 'text.txt', { type: 'text/plain' });

    const maxSizeMB = 1;
    await expect(imageCompression(file, { maxSizeMB, useWebWorker: false })).to.eventually.rejectedWith(/not an image/);
  });

  it('get the image orientation from Exif', async () => {
    const file = new File(JPG_FILE, JPG_NAME);
    const orientation = await getExifOrientation(file);
    expect(orientation).to.equal(-2);
  });

  it('alwaysKeepResolution', async () => {
    const file = new File([JPG_FILE], JPG_NAME, { type: 'image/jpeg' });

    const maxSizeMB = 1;

    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      useWebWorker: false,
      exifOrientation: -2,
      alwaysKeepResolution: true,
    });

    const temp1 = await drawFileInCanvas(file);
    const img1 = temp1[0];
    const temp2 = await drawFileInCanvas(compressedFile);
    const img2 = temp2[0];
    expect(img2.width).to.equal(img1.width);
    expect(img2.height).to.equal(img1.height);
  });

  it('abort compression', async () => {
    const file = new File([JPG_FILE], JPG_NAME, { type: 'image/jpeg' });

    const maxSizeMB = 1;

    const controller = new AbortController();

    setTimeout(() => {
      controller.abort(new Error('I just want to stop'));
    }, 0);

    expect(imageCompression(file, {
      maxSizeMB,
      useWebWorker: false,
      exifOrientation: -2,
      signal: controller.signal,
    })).to.eventually.rejectedWith(/I just want to stop/);
  });

  it('getBrowserName Chrome', async () => {
    global.navigator = { userAgent: 'Chrome' };
    const browserName = imageCompression.getBrowserName();
    expect(browserName).to.equal(BROWSER_NAME.CHROME);
  });

  it('getBrowserName iPhone', async () => {
    global.navigator = { userAgent: 'WebKit iPhone' };
    const browserName = imageCompression.getBrowserName();
    expect(browserName).to.equal(BROWSER_NAME.MOBILE_SAFARI);
  });

  it('getBrowserName Safari', async () => {
    global.navigator = { userAgent: 'Safari' };
    const browserName = imageCompression.getBrowserName();
    expect(browserName).to.equal(BROWSER_NAME.DESKTOP_SAFARI);
  });

  it('getBrowserName Firefox', async () => {
    global.navigator = { userAgent: 'Firefox' };
    const browserName = imageCompression.getBrowserName();
    expect(browserName).to.equal(BROWSER_NAME.FIREFOX);
  });

  it('getBrowserName MSIE', async () => {
    global.navigator = { userAgent: 'MSIE' };
    const browserName = imageCompression.getBrowserName();
    expect(browserName).to.equal(BROWSER_NAME.IE);
  });

  it('getBrowserName Other', async () => {
    global.navigator = { userAgent: 'Other' };
    const browserName = imageCompression.getBrowserName();
    expect(browserName).to.equal(BROWSER_NAME.ETC);
  });

  it('approximateBelowMaximumCanvasSizeOfBrowser', async () => {
    global.navigator = { userAgent: 'Chrome' };
    const browserName = imageCompression.getBrowserName();
    const maximumCanvasSize = MAX_CANVAS_SIZE[browserName];
    const { width, height } = imageCompression.approximateBelowMaximumCanvasSizeOfBrowser(maximumCanvasSize * 1.2, maximumCanvasSize * 1.3);
    expect(width * height).to.be.lessThanOrEqual(maximumCanvasSize * maximumCanvasSize);
  });

  it('approximateBelowMaximumCanvasSizeOfBrowser 2', async () => {
    global.navigator = { userAgent: 'Chrome' };
    const browserName = imageCompression.getBrowserName();
    const maximumCanvasSize = MAX_CANVAS_SIZE[browserName];
    const { width, height } = imageCompression.approximateBelowMaximumCanvasSizeOfBrowser(maximumCanvasSize * 1.3, maximumCanvasSize * 1.2);
    expect(width * height).to.be.lessThanOrEqual(maximumCanvasSize * maximumCanvasSize);
  });

  afterEach(() => {
  });
});
