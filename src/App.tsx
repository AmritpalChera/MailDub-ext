/*global chrome*/

import { useEffect, useRef, useState } from "react";
import { GiLetterBomb, GiLoveLetter } from 'react-icons/gi';
import { ThreeCircles, ThreeDots } from 'react-loader-spinner';
import { BsFillArrowLeftSquareFill, BsFillArrowRightSquareFill } from 'react-icons/bs';
import backendData from "./backend";
import axios, { AxiosInstance } from "axios";

// console.log('node env: ', process.env.NODE_ENV);

let emailImagesCopy: string[] = [];
let imageIndex = -1;
let isOpen = false;
let emailSummary = '';
let generatingImage = false;
let backend: AxiosInstance;

function App() {
  // outer html inner html
  const customDom = useRef(null);
  const [isOpenDummy, setIsOpenDummy] = useState<boolean>(false);
  
  const toggleIsOpen = () => {
    setIsOpenDummy(!isOpen);
    isOpen = !isOpen;
  };


  const [loaded, setLoaded] = useState<boolean>(false);

  const [selectedSocial, setSelectedSocial] = useState('twitter');
  const [isMailOpen, setIsMailOpen] = useState(false);

  const windowRef = useRef<HTMLDivElement | null>(null);
  // button refs
  const changeImageRedoneC = useRef<HTMLButtonElement | null>(null);
  const downloadImageRef = useRef<HTMLButtonElement | null>(null);
  const twitterRef = useRef<HTMLButtonElement | null>(null);
  const instagramRef = useRef<HTMLButtonElement | null>(null);
  const linkedinRef = useRef<HTMLButtonElement | null>(null);
  const facebookRef = useRef<HTMLButtonElement | null>(null);

  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const [emailText, setEmailText] = useState<string>('');
  
  const [emailImages, setEmailImages] = useState<string[]>([]);
  
  const [emailImageIndex, setEmailImageIndex] = useState<number>(-1);
  const [currentImage, setCurrentImage] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  const nextImageRef = useRef<HTMLButtonElement | null>(null);
  const prevImageRef = useRef<HTMLButtonElement | null>(null);

  const [summaryText, setSummaryText] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

  const copyTextRef = useRef<HTMLButtonElement | null>(null);
  const shareRef = useRef<HTMLButtonElement | null>(null);
  const regenerateTextRef = useRef<HTMLButtonElement | null>(null);

  const identifyMailOpen = (windowUrl: string) => {
    const mailHash = windowUrl.split('/').slice(-1)[0];
    // console.log('mailhash is: ', mailHash);
    // console.log('length: ', mailHash.length);
    if (mailHash.length === 32) {
      // console.log('setting to true');
      setIsMailOpen(true);
    } else setIsMailOpen(false);
  }

  const observeUrlChange = () => {
    let oldHref = document.location.href;
    const body = document.querySelector("body")!;
    const observer = new MutationObserver(mutations => {
      if (oldHref !== document.location.href) {
        oldHref = document.location.href;
        /* Changed ! your code here */
        // console.log(document.location.href);
        identifyMailOpen(document.location.href);
      }
    });
    observer.observe(body, { childList: true, subtree: true });
  };
  
  const summarizeText = async (socialMedia: string) => {
    setLoadingSummary(true);
    let data = await backend!.post('/social', { social: socialMedia, emailContent: emailText })
      .then((res) => res.data).catch(err => {
        console.log(err)
        console.log(err.response?.data)
      });
    if (!data) {
      data = {
        text: "Could not load data"
      }
    };

    if (data.text) {
      setSummaryText(data.text);
      emailSummary = data.text;
    }
    setLoadingSummary(false);
    // console.log('summary is: ', data.text);
  }

  // useBackgroundKeepaliveHack();


  const loadText = async () => {
    const emailContentHtml = document.getElementsByClassName('gs')[0];
    let emailContent = emailContentHtml?.textContent;
    if (!emailContent) {
      console.log('email content could not be fetched');
      return;
    }
    emailContent = emailContent!.replace(/\n\s*\n\s*\n/g, '\n\n');
    emailContent = emailContent!.replace(/  +/g, ' ');
    
    setEmailText(emailContent.substring(0, 3000));
    
    const images = emailContentHtml.getElementsByTagName('img'); 
    var srcList = [];
    for (var i = 0; i < (images.length) && i < 15; i++) {
      const source = images[i].src;
      const type = source.split('.').slice(-1)[0];
      const allowedFormats = ['png', 'jpeg', 'jpg'];
      // console.log('image type is: ', type)
      if (allowedFormats.includes(type)) {
        srcList.push(images[i].src);
      }
    }

    // console.log('images of email are: ', srcList);
    if (srcList.length > 0) {
      emailImagesCopy = srcList;
      imageIndex = 0;
      setEmailImages(srcList);
      setEmailImageIndex(0);
      setCurrentImage(srcList[0]);
    }

    
  }

  useEffect(() => {
    const setBackend = async () => {
      let key = await chrome.storage.sync.get('userId');
      backend = (backendData(key.userId));
    }
    setBackend();
  }, [])

  const extractedData = async () => {
    // console.log(document);
    // console.log(document.readyState)
    // console.log(document.getElementsByClassName('nH ar4 z'));
    const _target: any = (document.getElementsByClassName('nH ar4 z')).item(0);
    
    _target?.appendChild(customDom.current!);
    // console.log(_target.style)
    if (_target?.style) {
      _target.style.position = 'relative';
    }
    setLoaded(true);
  }

  // useEffect(() => {
  //   console.log('email text is: ', emailText);
  // }, [emailText])

  // useEffect(() => {
  //   console.log('current image is: ', currentImage);
  //   console.log('emailImage index: ', emailImageIndex);
  //   console.log('overall images', emailImages);
  // }, [emailImages, emailImageIndex, currentImage])
  

  useEffect(() => {
    if (isMailOpen && loaded) {
      loadText(); // load text right when person opens email;
    } else if (!isMailOpen) {
      setEmailText('');
      setIsOpenDummy(false);
      imageIndex = -1;
      emailImagesCopy = [];
      isOpen = false;
      setSummaryText('');
      emailSummary = '';
    }
  }, [isMailOpen, loaded])

  useEffect(() => {
    const loaded = document.readyState === "interactive";
    observeUrlChange();
    if (loaded) {
      setTimeout(() => extractedData(), 5000);
    }    
  }, [document.readyState]);

  const handleGenerateImageClick = async (e: any) => {
    // console.log('image generating: ', generatingImage);
    // console.log('image generating real: ', isGeneratingImage)
    if (generatingImage) return;
    // console.log('change image');
    generatingImage = true;
    setIsGeneratingImage(generatingImage);
    // console.log("eail summary is: ", summaryText)
    // console.log('local summary: ', emailSummary);
    const data = await backend!.post('/image', {emailSummary: emailSummary}).then(res => res.data).catch(err => {/** */})
    // console.log(data);
    if (!data) {
      console.log('could not generate image');
      return;
    }
    // console.log('old images copy: ', emailImagesCopy)
    emailImagesCopy.push(data.url);
    // console.log('images copy: ', emailImagesCopy);
    setEmailImages([...emailImagesCopy]);
    imageIndex = emailImagesCopy.length - 1;
    // console.log('new image index: ', imageIndex)
    setEmailImageIndex(imageIndex);
    generatingImage = false;
    setIsGeneratingImage(generatingImage);
  };

  useEffect(() => {
    if (imageIndex >= 0) setCurrentImage(emailImages[imageIndex]);
  }, [emailImageIndex])


  const handleDownloadImageClick = (e: any) => {
    // console.log('download image');
    window.open(emailImages[imageIndex], '_blank', 'noopener,noreferrer')
  }

  const handleTwitterClick = (e: any) => {
    // console.log('twitter clicked');
    setSelectedSocial('twitter')
  };

  const handleInstagramClick = (e: any) => {
    // console.log('instagram clicked');
    setSelectedSocial('instagram')
  }

  const handleLinkedinClick = (e: any) => {
    // console.log('linkedin clicked');
    setSelectedSocial('linkedin')
  }

  const handleFacebookClick = (e: any) => {
    // console.log('facebook clicked');
    setSelectedSocial('facebook');
  }

  const handleTextContainerClick = (e: any) => {
    // console.log('text container!');
  }

  const handleCopyTextClick = (e: any) => {
    // console.log('copy text');
    navigator.clipboard.writeText(summaryText);
  }

  const handleRegenerateText = (e: any) => {
    // console.log('regenerate text');
    summarizeText(selectedSocial);
  }

  const handleShareClick = (e: any) => {
    let url = '';
    if (selectedSocial === 'twitter') {
      url = 'https://twitter.com'
    } else if (selectedSocial === 'instagram') {
      url = 'https://instagram.com'
    } else if (selectedSocial === 'facebook') {
      url = 'https://facebook.com'
    } else if (selectedSocial === 'linkedin') {
      url = 'https://linkedin.com'
    }

    window.open(url, '_blank', 'noopener noreferrer');
  }

  const handleNextImageClick = (e: any) => {
    // console.log('next button clicked');
    if (imageIndex < (emailImages.length -1)) imageIndex += 1;
    setEmailImageIndex(imageIndex);
  }

  const handlePreviousImageClick = (e: any) => {
    // console.log('previous image button clicked'); 
    if (imageIndex > 0) imageIndex -= 1;
    setEmailImageIndex(imageIndex);
  }

  const handleWindowClick = (e: any) => {
    e.stopPropagation();
  }

  useEffect(() => {
    // console.log('selected social is: ', selectedSocial)
    if (summaryText) {
      // console.log('summarize text useEffect: ', summaryText)
      summarizeText(selectedSocial);
    }
  }, [selectedSocial]);

  

  useEffect(() => {
    if (windowRef.current) {
      // console.log('attaching listeners')
      if(!summaryText) summarizeText('twitter');
      windowRef.current.addEventListener('click', handleWindowClick);
      changeImageRedoneC.current?.addEventListener('click', handleGenerateImageClick);
      downloadImageRef.current?.addEventListener('click', handleDownloadImageClick);
      twitterRef.current?.addEventListener('click', handleTwitterClick);
      instagramRef.current?.addEventListener('click', handleInstagramClick);
      linkedinRef.current?.addEventListener('click', handleLinkedinClick);
      facebookRef.current?.addEventListener('click', handleFacebookClick);
      nextImageRef.current?.addEventListener('click', handleNextImageClick);
      prevImageRef.current?.addEventListener('click', handlePreviousImageClick);
    }

    return () => {
      if (windowRef.current) {
        windowRef.current.removeEventListener('click', handleWindowClick);
        changeImageRedoneC.current?.removeEventListener('click', handleGenerateImageClick);
        downloadImageRef.current?.removeEventListener('click', handleDownloadImageClick);
        twitterRef.current?.removeEventListener('click', handleTwitterClick);
        instagramRef.current?.removeEventListener('click', handleInstagramClick);
        linkedinRef.current?.removeEventListener('click', handleLinkedinClick);
        facebookRef.current?.removeEventListener('click', handleFacebookClick);
        nextImageRef.current?.removeEventListener('click', handleNextImageClick);
        prevImageRef.current?.removeEventListener('click', handlePreviousImageClick);
      }
    }
  }, [windowRef, isOpenDummy]);



  useEffect(() => {
    if (!loadingSummary) {
      textContainerRef.current?.addEventListener('click', handleTextContainerClick);
      copyTextRef.current?.addEventListener('click', handleCopyTextClick);
      regenerateTextRef.current?.addEventListener('click', handleRegenerateText);
      shareRef.current?.addEventListener('click', handleShareClick);
    }

    return () => {
      textContainerRef.current?.removeEventListener('click', handleTextContainerClick);
      copyTextRef.current?.removeEventListener('click', handleCopyTextClick);
      shareRef.current?.removeEventListener('click', handleShareClick);
      regenerateTextRef.current?.removeEventListener('click', handleRegenerateText);
    }
  }, [loadingSummary]);


  useEffect(() => {
    const dom: HTMLElement = customDom?.current!;
    dom && dom.addEventListener('click', toggleIsOpen);
    identifyMailOpen(document.location.href);

    return () => dom && dom.removeEventListener('click', toggleIsOpen);
  }, [customDom]);


  const socialButtonSelected = (social: string) => (social === selectedSocial);

  const openWindow = () => (
    <div id="windowMaildub" ref={windowRef} className="h-[550px] z-[1000000000] w-[500px] p-4 bg-white shadow-lg shadow-black border-gray border-2 absolute bottom-10 right-10 rounded-lg">
      <div className="relative flex flex-col">
        <div className="flex ">
          <img src={currentImage || "https://image.lexica.art/full_jpg/e75035e1-a48a-4cf0-8c6a-cfdf4a204857"} className="max-w-[150px] w-full max-h-[150px] h-full" />
          <div className="flex flex-1 flex-col items-center">
            <div className="text-3xl font-bold text-primary">
              <a href="https://maildub.club/manage" target="blank" className="text-primary">MailDub.Club</a>
              
            </div>
            <button ref={changeImageRedoneC} className="mt-6 h-8 text-dark rounded-full flex justify-center items-center text-md w-48 bg-white border-black border-2 px-4 py-1">
              {isGeneratingImage ?
                <ThreeDots 
                height="10" 
                width="40" 
                radius="9"
                color="#4fa94d" 
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                visible={true}
                /> :
                'Generate Image'}
            </button>
            <div className="flex items-center mt-4">
              <button ref={prevImageRef} className={`${emailImageIndex === 0 ? 'text-gray' : 'text-primary hover:text-primary/80'} rounded-full text-lg mr-4`}><BsFillArrowLeftSquareFill /></button>
              <button ref={downloadImageRef} className=" text-white rounded-full text-md h-8 w-48 bg-primary hover:bg-primary/80 border-primary px-4 py-1">Download Image</button>
              <button ref={nextImageRef} className={` ${emailImageIndex === (emailImagesCopy.length - 1) ? 'text-gray' : 'text-primary hover:text-primary/80'} rounded-full text-lg ml-4`}><BsFillArrowRightSquareFill /></button>
            </div>
          </div>
        </div>
        <div className="flex mt-4">
          <button ref={twitterRef} className={`text-sm rounded-full w-24 hover:shadow-md hover:shadow-gray  px-2 py-1 mr-4 ${socialButtonSelected('twitter') ? 'bg-primary text-white' : 'bg-gray-300'}`}>Twitter</button>
          <button ref={instagramRef} className={`text-sm rounded-full w-24 hover:shadow-md hover:shadow-gray bg-gray-300 px-2 py-1 mr-4 ${socialButtonSelected('instagram') ? 'bg-primary text-white' : 'bg-gray-300'}`}>Instagram</button>
          <button ref={facebookRef} className={`text-sm rounded-full w-24 hover:shadow-md hover:shadow-gray bg-gray-300 px-2 py-1 mr-4 ${socialButtonSelected('facebook') ? 'bg-primary text-white' : 'bg-gray-300'}`}>Facebook</button>
          <button ref={linkedinRef} className={`text-sm rounded-full w-24 hover:shadow-md hover:shadow-gray bg-gray-300 px-2 py-1 mr-4 ${socialButtonSelected('linkedin') ? 'bg-primary text-white' : 'bg-gray-300'}`}>LinkedIn</button>
        </div>
        {!loadingSummary ? (
          <div className="border-2 border-gray-300 h-64 mt-4">
            <div ref={textContainerRef} id="md_textContainer" className="whitespace-pre-wrap overflow-y-scroll p-3 cursor-text h-64 pb-8">
              {summaryText}
            </div>
            <div className="flex flex-1 items-end justify-end mt-2">
              <button ref={regenerateTextRef} className="text-dark rounded-full text-md w-32 mr-4 bg-white px-4 h-7 shadow-sm shadow-gray hover:shadow-lg hover:shadow-gray">Regenerate</button>
              <button ref={shareRef} className="text-white rounded-full text-md w-24 bg-primary border-primary px-4 shadow-sm h-7  shadow-gray hover:bg-primary/80 mr-4">Share</button>
              <button ref={copyTextRef} className="text-white rounded-full text-md w-32 bg-primary border-primary px-4 shadow-sm h-7  shadow-gray hover:bg-primary/80">Copy Text</button>
            </div>
          </div>
        ) : (
          <div className="w-full h-72 flex items-center justify-center">
            
            <ThreeCircles
              height="100"
              width="100"
              color="#4fa94d"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
              ariaLabel="three-circles-rotating"
              outerCircleColor=""
              innerCircleColor=""
              middleCircleColor=""
            />
          </div>
        )}
      </div>
    </div>
  );

  if (!isMailOpen || !emailText) {
    return <div ref={customDom} />
  }

  return (
    <div ref={customDom} className="absolute shadow-md shadow-gray right-4 cursor-pointer flex justify-center items-center bg-primary bottom-4 rounded-full h-12 w-12">
      {isOpenDummy ? <GiLoveLetter className="text-3xl text-white" /> : <GiLetterBomb className="text-3xl text-white" /> }
      <div className="relative">
        {isOpenDummy && openWindow()}
      </div>
    </div>
  );
}

export default App;
