import time, os, traceback, random, twint, hashlib, feedparser, re, requests, threading, logging
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver import FirefoxOptions
from fake_useragent import UserAgent

logging.Logger.propagate = False

def get_driver(onion=True):
    # Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0
    profile = webdriver.FirefoxProfile()
    if onion:
        profile.set_preference("general.useragent.override", UserAgent().firefox)
    webdriver_options = FirefoxOptions()
    webdriver_options.add_argument("--headless")
    webdriver_options.add_argument("--disable-extensions")
    webdriver_options.add_argument("--no-sandbox")
    webdriver_options.add_argument("--disable-application-cache")
    webdriver_options.add_argument("--disable-gpu")
    webdriver_options.add_argument("--disable-dev-shm-usage")
    if onion:
        profile.set_preference("network.proxy.type", 1)
        profile.set_preference("network.proxy.socks", "127.0.0.1")
        profile.set_preference("network.proxy.socks_port", 9050)
    driver = webdriver.Firefox(executable_path="/api/bin/geckodriver", options=webdriver_options, firefox_profile=profile, log_path=os.path.devnull)
    return driver

def get_lego(name):
    legos = os.listdir("app/static/assets/img/lego")
    random.seed(int(hashlib.md5(name.encode()).hexdigest(), 16))
    return legos[random.randrange(len(legos))]

def get_color(name):
    colors = ["mediumvioletred", "darkkhaki", "aquamarine", "lightcyan", "maroon", "lightslategray", "lightpink", "royalblue", "lightgreen", "cornflowerblue", "burlywood", "midnightblue", "darkslategray", "slategrey", "olivedrab", "lavender", "yellowgreen", "orange", "salmon", "palevioletred", "cadetblue", "firebrick", "lightseagreen", "dimgray", "steelblue", "bisque", "gold", "slateblue", "crimson", "saddlebrown"]
    random.seed(int(hashlib.md5(name.encode()).hexdigest(), 16))
    return colors[random.randrange(len(colors))]

#                    __    
#(\,----------------'()'--o
# (_    _ REQUESTS _    /~" 
#  (_)_)           (_)_)    
####################################################################################

def speakrj(channel):
    headers = {
        "User-Agent": UserAgent().firefox,
    }
    session = requests.session()
    session.proxies = {}
    session.proxies["http"] = "socks5h://localhost:9050"
    session.proxies["https"] = "socks5h://localhost:9050"
    r = session.get("https://www.speakrj.com/audit/report/"+channel+"/youtube", headers=headers)
    return len(r.text) < 90000

def github_version():
    headers = {
        "User-Agent": UserAgent().firefox,
    }
    session = requests.session()
    session.proxies = {}
    session.proxies["http"] = "socks5h://localhost:9050"
    session.proxies["https"] = "socks5h://localhost:9050"
    return session.get("https://github.com/PwnedShell/Bugs-feed/releases/latest", headers=headers).url.rsplit("/")[-1]

#                 __    
#(\,-------------'()'--o
# (_    _ NEWS _    /~" 
#  (_)_)       (_)_)    
####################################################################################

def news(sources):
    threads = []
    news = []
    for source in sources:
        t = threading.Thread(target=globals()[source], args=(news,))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    return news

#【 THEHACKERNEWS 】
def thehackernews(news):
    feedparser.USER_AGENT = UserAgent().firefox
    last_thehackernews = feedparser.parse("https://feeds.feedburner.com/TheHackersNews")
    logging.info("Scrapping The Hacker News")
    for article in last_thehackernews.entries:
        name = article.title
        link = article.link
        html_description = BeautifulSoup(article.description, features="html.parser")
        description = html_description.get_text()
        raw_date = article.published.split(", ")[1].rsplit(" ", 1)[0]
        date = datetime.strptime(raw_date, "%d %b %Y %H:%M:%S")
        news.append({"name": name, "description": description, "link": link, "web": "The Hacker News", "date": date, "lego": get_lego(name), "color": get_color(name), "saved": False})
    logging.info("The Hacker News scrapped")

#【 HAKIN9 】
def hakin9(news):
    feedparser.USER_AGENT = UserAgent().firefox
    last_hakin9 = feedparser.parse("https://hakin9.org/feed/")
    logging.info("Scrapping Hakin9")
    for article in last_hakin9.entries:
        name = article.title
        link = article.link
        html_description = BeautifulSoup(article.description, features="html.parser")
        description = html_description.get_text().split(" …")[0]
        raw_date = article.published.split(", ")[1].rsplit(" ", 1)[0]
        date = datetime.strptime(raw_date, "%d %b %Y %H:%M:%S")
        news.append({"name": name, "description": description, "link": link, "web": "Hakin9", "date": date, "lego": get_lego(name), "color": get_color(name), "saved": False})        
    logging.info("Hakin9 scrapped")


#【 THE HACKING ARTICLES 】
def thehackingarticles(news):
    feedparser.USER_AGENT = UserAgent().firefox
    last_thehackingarticles = feedparser.parse("https://www.hackingarticles.in/feed/")
    logging.info("Scrapping The Hacking Articles")
    for article in last_thehackingarticles.entries:
        name = article.title
        link = article.link
        html_description = BeautifulSoup(article.description, features="html.parser")
        description = html_description.get_text().rsplit("The post ", 1)[0]
        raw_date = article.published.split(", ")[1].rsplit(" ", 1)[0]
        date = datetime.strptime(raw_date, "%d %b %Y %H:%M:%S")
        news.append({"name": name, "description": description, "link": link, "web": "The Hacking Articles", "date": date, "lego": get_lego(name), "color": get_color(name), "saved": False})        
    logging.info("The Hacking Articles scrapped")

#【 HACKER NOON 】
def hackernoon(news):
    feedparser.USER_AGENT = UserAgent().firefox
    last_hackernoon = feedparser.parse("https://hackernoon.com/feed")
    logging.info("Scrapping Hacker Noon")
    for article in last_hackernoon.entries:
        name = article.title
        link = article.link
        html_description = BeautifulSoup(article.description, features="html.parser")
        description = html_description.get_text()
        raw_date = article.published.split(", ")[1].rsplit(" ", 1)[0]
        date = datetime.strptime(raw_date, "%d %b %Y %H:%M:%S")
        news.append({"name": name, "description": description, "link": link, "web": "Hacker Noon", "date": date, "lego": get_lego(name), "color": get_color(name), "saved": False})  
    logging.info("Hacker Noon scrapped")

#【 SECURELIST 】
def securelist(news):
    feedparser.USER_AGENT = UserAgent().firefox
    last_securelist = feedparser.parse("https://securelist.com/feed/")
    logging.info("Scrapping Securelist")
    for article in last_securelist.entries:
        name = article.title
        link = article.link
        html_description = BeautifulSoup(article.description, features="html.parser")
        description = html_description.get_text()
        raw_date = article.published.split(", ")[1].rsplit(" ", 1)[0]
        date = datetime.strptime(raw_date, "%d %b %Y %H:%M:%S")
        news.append({"name": name, "description": description, "link": link, "web": "Securelist", "date": date, "lego": get_lego(name), "color": get_color(name), "saved": False})       
    logging.info("Securelist scrapped")

#【 SHIFT LEFT 】
def shiftleft(news):
    feedparser.USER_AGENT = UserAgent().firefox
    last_shiftleft = feedparser.parse("https://blog.shiftleft.io/feed")
    logging.info("Scrapping ShiftLeft")
    for article in last_shiftleft.entries:
        name = article.title
        link = article.link
        html_description = BeautifulSoup(article.description, features="html.parser")
        description = " ".join(html_description.get_text().split(" ")[:50])
        raw_date = article.published.split(", ")[1].rsplit(" ", 1)[0]
        date = datetime.strptime(raw_date, "%d %b %Y %H:%M:%S")
        news.append({"name": name, "description": description, "link": link, "web": "ShiftLeft", "date": date, "lego": get_lego(name), "color": get_color(name), "saved": False})
    logging.info("ShiftLeft scrapped")

#【 PENTEST LAB 】
def pentestlab(news):
    feedparser.USER_AGENT = UserAgent().firefox
    last_pentestlab = feedparser.parse("https://pentestlab.blog/feed/")
    logging.info("Scrapping Pentest Lab")
    for article in last_pentestlab.entries:
        name = article.title
        link = article.link
        html_description = BeautifulSoup(article.description, features="html.parser")
        description = " ".join(html_description.get_text().split(" ")[:50])
        raw_date = article.published.split(", ")[1].rsplit(" ", 1)[0]
        date = datetime.strptime(raw_date, "%d %b %Y %H:%M:%S")
        news.append({"name": name, "description": description, "link": link, "web": "Pentest Lab", "date": date, "lego": get_lego(name), "color": get_color(name), "saved": False})
    logging.info("Pentest Lab scrapped")

#                   __    
#(\,---------------'()'--o
# (_    _ VIDEOS _    /~" 
#  (_)_)          (_)_)    
####################################################################################

def videos(channels=[]):
    threads = []
    videos = []
    for channel in channels:
        t = threading.Thread(target=youtube_thread, args=(channel, videos))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    return videos

def youtube_thread(channel, videos):
    url = "https://www.youtube.com/channel/" + channel
    logging.info("Scrapping %s channel", channel)
    driver = get_driver(False)
    driver.set_script_timeout(30)
    try:
        driver.get(url)
        try:
            driver.find_element(By.XPATH, "//*[text()='I agree']").click()
        except Exception:
            pass
        driver.implicitly_wait(10)
        driver.find_elements(By.CLASS_NAME, "tp-yt-paper-tab")[1].click()
        driver.implicitly_wait(5)
        username = driver.find_element(By.CLASS_NAME, "ytd-channel-name").text
        scrapped_videos = driver.find_elements(By.CSS_SELECTOR, "ytd-grid-video-renderer")
        scrapped_videos.reverse()
        for video in scrapped_videos:
            try:
                img = video.find_element(By.ID, "img").get_attribute("src")
                video_id = img.split("?")[0].split("/hqdefault")[0].split("/vi/")[1]
                duration = video.find_element(By.CSS_SELECTOR, "ytd-thumbnail-overlay-time-status-renderer").text
                if duration == "PREMIERE":
                    continue
                date = get_videos_date(video.find_element(By.ID, "metadata-line").text.split("\n")[1])
                title = video.find_element(By.ID, "video-title").text
                videos.append({"name": title, "channel": channel, "username": username, "video_id": video_id, "duration": duration, "date": date, "saved": False})
            except Exception:
                pass
    except Exception:
        traceback.print_exc()
    finally:
        logging.info("%s channel scrapped", channel)
        driver.quit()

def get_videos_date(date):
    splited_date = date.split()
    if splited_date[0].startswith("Streamed"):
        number = int(splited_date[1])
        measure = splited_date[2]
    else:
        number = int(splited_date[0])
        measure = splited_date[1]
    if measure.startswith("minute"):
        return datetime.now() - timedelta(minutes=number)
    elif measure.startswith("hour"):
        return datetime.now() - timedelta(hours=number)
    elif measure.startswith("day"):
        return datetime.now() - timedelta(days=number)
    elif measure.startswith("week"):
        return datetime.now() - timedelta(weeks=number)
    elif measure.startswith("month"):
        return datetime.now() - timedelta(days=number*30)
    elif measure.startswith("year"):
        return datetime.now() - timedelta(days=number*365)
    else:
        return datetime.now()

#                   __    
#(\,---------------'()'--o
# (_    _ TWEETS _    /~" 
#  (_)_)          (_)_)    
####################################################################################

def twitter(hashtags):
    tweets_list = []
    threads = []
    for hashtag in hashtags:
        t = threading.Thread(target=tweets_thread, args=(hashtag[0], hashtag[1], tweets_list))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    return tweets_list

def get_t_co(url, finall_urls):
    try:
        finall_urls.update({url: requests.get(url, timeout=3.5).url})
    except Exception:
        logging.warning("%s unwrap process failed", url)
        finall_urls.update({url: url})

def tweets_url_thread(tweet, index, tweets):
    threads = []
    finall_urls = {}
    for url in tweet["tweet_urls"]:
        t = threading.Thread(target=get_t_co, args=(url, finall_urls))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    for url in tweet["tweet_urls"]:
        finall_url = finall_urls.get(url)
        if finall_url.startswith("https://twitter.com/"):
            tweet_text = tweet["tweet"].replace(url, "")
        else:
            tweet_text = tweet["tweet"].replace(url, finall_url)
        tweet["tweet"] = tweet_text
        tweets[index] = tweet

def tweets_thread(hashtag, last, tweets_list):
    logging.info("Scrapping %s tweets", hashtag)
    tweets_by_hashtag = []
    scrapped_tweets = []
    t_c = twint.Config()
    t_c.Search = hashtag
    t_c.Limit = 20
    t_c.Store_object = True
    t_c.Store_object_tweets_list = scrapped_tweets
    t_c.Filter_retweets = True
    t_c.Hide_output = True
    twint.run.Search(t_c)

    if last == None:
        last = {"link": "never_works"}
    for t in scrapped_tweets:
        if t.link == last["link"]:
            break
        if ("/tweet_video_thumb/" in t.thumbnail):
            photos = [t.thumbnail]
        else:
            photos = [t.photos]
        tweet = t.tweet
        tweet_urls = re.findall("https://t.co/\w+", tweet)
        tweet = tweet.replace("  ", " <br> ")
        raw_date = t.datestamp + " " + t.timestamp
        date = datetime.strptime(raw_date, "%Y-%m-%d %H:%M:%S")
        tweets_by_hashtag.append({"tweet": tweet, "tweet_urls": tweet_urls, "tweet_id": t.link.rsplit('/', 1)[1], "hashtag": hashtag, "link": t.link, "user": t.username, "date": date, "photos": photos, "lego": get_lego(t.username), "color": get_color(t.username), "saved": False})
    
    threads = []
    for index, tweet in enumerate(tweets_by_hashtag):
        t = threading.Thread(target=tweets_url_thread, args=(tweet, index, tweets_by_hashtag))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    for tweet in tweets_by_hashtag:
        tweets_list.append(tweet)
    logging.info("%s tweets scrapped", hashtag)

#                            __    
#(\,------------------------'()'--o
# (_    _ VULNERABILITIES _    /~" 
#  (_)_)                  (_)_)    
####################################################################################

#【 HACKERONE 】
def hackerone():
    url = "https://hackerone.com/hacktivity"
    hackerone_list = []
    logging.info("Scrapping hackerone")
    driver = get_driver()
    driver.set_script_timeout(30)
    try:
        driver.get(url)
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "daisy-separator")))
        html = driver.find_element(By.CLASS_NAME, "infinite-scroll-component").get_attribute("innerHTML")
        elements = BeautifulSoup(html, features="html.parser")
        for element in elements.find_all("div", {"class": "hacktivity-item"}):
            try:
                level = element.find("div", {"class": "spec-severity-rating"}).text
                if level in ["Critical", "High", "Medium", "Low"]:
                    name = element.find("a", {"class": "spec-hacktivity-item-title"})
                    link = name.get("href")
                    name = name.find("strong").text.replace("█", "◦")
                    product = element.find("a", {"class": "daisy-link--major"})
                    product_link = "https://hackerone.com" + product.get("href")
                    product = product.text
                    raw_date = element.find("span", {"class": "spec-hacktivity-item-timestamp"}).find("span").get("title")
                    date = datetime.strptime(raw_date.split(":", 1)[0][:-3], "%B %d, %Y")
                    hackerone_list.append({"name": name, "product": product, "product_link": product_link, "link": link, "level": level, "date": date, "saved": False})
            except Exception:
                pass
    except Exception:
        traceback.print_exc()
    finally:
        logging.info("Hackerone scrapped")
        driver.quit()
        return hackerone_list

#【 BUGCROWD 】
def bugcrowd():
    url = "https://bugcrowd.com/crowdstream?filter=disclosures"
    bugcrowd_list = []
    logging.info("Scrapping bugcrowd")
    driver = get_driver(False)
    driver.set_script_timeout(30)
    try:
        driver.get(url)
        WebDriverWait(driver, 25).until(EC.presence_of_element_located((By.CLASS_NAME, "bc-crowdstream-item")))
        html = driver.find_element(By.XPATH, "//section/div/ul").get_attribute("innerHTML")
        elements = BeautifulSoup(html, features="html.parser")
        for element in elements.find_all("li", {"class": "bc-crowdstream-item"}):
            try:
                priority = element.find("span", {"class": "bc-badge"}).text
                if priority not in ["P1", "P2", "P3", "P4"]:
                    continue
                name = element.find("p", {"class": "bc-helper-nomargin"}).find("a")
                link = "https://bugcrowd.com" + name.get("href")
                name = name.text
                raw_date = element.find("span", {"class": "bc-crowdstream-item__date"}).text.split("on ", 1)[1]
                date = datetime.strptime(raw_date, "%d %b %Y")
                program = element.find_all("li")[1].find("a")
                program_link = "https://bugcrowd.com" + program.get("href")
                program = program.text
                bugcrowd_list.append({"name": name, "link": link, "program": program, "program_link": program_link, "priority": priority, "date": date, "saved": False})
            except Exception:
                pass
    except Exception:
        traceback.print_exc()
    finally:
        logging.info("Bugcrowd scrapped")
        driver.quit()
        return bugcrowd_list

#【 CVE 】
def cve():
    url = "https://twitter.com/CVEnew"
    cve_list = []
    logging.info("Scrapping cve")
    driver = get_driver(False)
    driver.set_script_timeout(30)
    try:
        driver.get(url)
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "article[role='article']")))
        html = driver.find_element(By.XPATH, "//div[@aria-label='Timeline: CVE’s Tweets']").get_attribute("innerHTML")
        elements = BeautifulSoup(html, features="html.parser")
        for element in elements.find("div").findAll("article"):
            try:
                text = element.find_all("span", {"class": ["css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0"]})[4].text.split(" ", 1)
                name = text[0]
                description = text[1]
                raw_date = element.find("time").get("datetime")
                date = datetime.strptime(raw_date.split(":", 1)[0][:-3], "%Y-%m-%d")
                link = element.find("a", {"dir": "ltr"}).get("href")
                cve_list.append({"name": name, "link": link, "description": description, "date": date, "saved": False})
            except Exception:
                pass
    except Exception:
        traceback.print_exc()
    finally:
        logging.info("Cve scrapped")
        driver.quit()
        return cve_list

#【 EXPLOIT DB 】
def exploitdb():
    exploitdb_list = []
    logging.info("Scrapping Exploit-db")
    last_exploitdb = feedparser.parse("https://www.exploit-db.com/rss.xml")
    for article in last_exploitdb.entries:
        name = article.description
        link = article.link
        category = article.title.split("]")[0][1:]
        raw_date = article.published.split(", ")[1].rsplit(" ", 1)[0]
        date = datetime.strptime(raw_date, "%d %b %Y %H:%M:%S")
        exploitdb_list.append({"name": name, "category": category, "link": link, "date": date, "saved": False})
    logging.info("Exploit-db scrapped")
    return exploitdb_list

#                  __    
#(\,--------------'()'--o
# (_    _ PAPERS _    /~" 
#  (_)_)          (_)_)    
####################################################################################

def exploitdbsp():
    url = "https://www.exploit-db.com/papers"
    papers = []
    logging.info("Scrapping Exploit-db papers")
    driver = get_driver()
    driver.set_script_timeout(30)
    try:
        driver.get(url)    
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.XPATH, "//*[@id='papers-table']/tbody/*")))
        html = driver.find_element(By.ID, "papers-table").get_attribute("innerHTML")
        elements = BeautifulSoup(html, features="html.parser")
        for element in elements.find("tbody").find_all("tr"):
            try:
                td = element.find_all("td")
                date = datetime.strptime(td[0].text, "%Y-%m-%d")
                name = td[2].a.text
                link = "https://www.exploit-db.com" + td[2].a.get("href")
                platform = td[3].text
                language = td[4].text
                author = td[5].text
                papers.append({"name": name, "author": author, "date":date, "link": link, "platform": platform, "language": language, "saved": False})
            except Exception:
                pass
    except Exception:
        traceback.print_exc()
    finally:
        logging.info("Exploit-db papers scrapped")
        driver.quit()
        return papers

def nist():
    url = "https://csrc.nist.gov/publications/search?sortBy-lg=releasedate+DESC&viewMode-lg=brief&ipp-lg=50&status-lg=Final%2CDraft&series-lg=FIPS%2CSP%2CNISTIR%2CITL+Bulletin%2CWhite+Paper%2CBuilding+Block%2CUse+Case%2CJournal+Article%2CConference+Paper%2CBook&topicsMatch-lg=ANY&controlsMatch-lg=ANY"
    papers = []
    logging.info("Scrapping NIST papers")
    driver = get_driver()
    driver.set_script_timeout(30)
    try:
        driver.get(url) 
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, "tbody")))
        html = driver.find_element(By.TAG_NAME, "tbody").get_attribute("innerHTML")
        elements = BeautifulSoup(html, features="html.parser")
        for element in elements.find_all("tr"):
            try:
                td = element.find_all("td")
                serie = td[0].text
                number = td[1].text[1:]
                name = td[2].strong.text
                date = datetime.strptime(td[2].find_all("div")[2].strong.text, "%m/%d/%Y")
                try:
                    link = td[2].find_all("div")[3].find_all("span")[2].a.get("href")
                    if not link.startswith("https"):
                        link = "https://csrc.nist.gov" + link
                except Exception:
                    link = None
                status = td[3].text.strip()
                papers.append({"name": name, "link": link, "date": date, "number": number, "serie": serie, "status": status, "language": "English", "saved": False})
            except Exception:
                pass  
    except Exception:
        traceback.print_exc()
    finally:
        logging.info("NIST papers scrapped")
        driver.quit()
        return papers

# puedes definir el User-Agent?
def oxford():
    url = "https://academic.oup.com/cybersecurity/search-results?f_ContentType=Journal+Article&fl_SiteID=5188&page=1&sort=Date+%e2%80%93+Newest+First"
    papers = []
    logging.info("Scrapping Oxford papers")
    driver = get_driver()
    driver.set_script_timeout(60)
    try:
        driver.get(url) 
        driver.get(url)
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CLASS_NAME, "al-title")))
        html = driver.find_element(By.ID, "ContentColumn").get_attribute("innerHTML")
        elements = BeautifulSoup(html, features="html.parser")
        for element in elements.find_all("div", {"class": "sr-list al-article-box al-normal clearfix"}):
            try:
                name = element.find("a").text
                author = element.find("div", {"class": "sri-authors"}).text
                link = element.find("div", {"class": "al-citation-list"}).a.text
                raw_date = element.find("div", {"class": "sri-date al-pub-date"}).text.split("Published: ")[1]
                date = datetime.strptime(raw_date, "%d %B %Y")
                papers.append({"name": name, "author": author, "link": link, "date": date, "saved": False})
            except Exception:
                pass  
    except Exception:
        traceback.print_exc()
    finally:
        logging.info("Oxford papers scrapped")
        driver.quit()
        return papers