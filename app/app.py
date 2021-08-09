from os import getenv
import time, toml, re, atexit, threading, logging
from flask import Flask, jsonify, request, render_template, redirect, make_response, send_from_directory
from flask_compress import Compress
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson.json_util import ObjectId, dumps
from apscheduler.schedulers.background import BackgroundScheduler
import services.feeds as feeds_service
from dotenv import load_dotenv

app = Flask(__name__)
Compress(app)
client = MongoClient("mongodb://root:password@docker.mongo.db:27017/admin")
db = client.feeds
sb = client.saved
config = toml.load("app/services/config.toml")
logging.basicConfig(format="%(asctime)s - %(message)s", datefmt="%d-%b-%y %H:%M:%S", level=logging.INFO)
logging.Logger.propagate = False

#                   __    
#(\,---------------'()'--o
# (_    _ MEDIA _    /~" 
#  (_)_)         (_)_)    
####################################################################################

@app.route("/api/feeds/media/<collection>/refresh", methods=["GET"])
def add_media(collection, thread=False):
    if collection == "tweets":
        hashtags_list = []
        for hashtag in config.get("tweets_items").get("hashtags"):
            hashtags_list.append((hashtag, db.tweets.find_one({"hashtag": hashtag})))
        tweets_feed = feeds_service.twitter(hashtags_list)
        for tweet in tweets_feed:
            db.tweets.update_one({"tweet": tweet.get("tweet")}, {"$setOnInsert": tweet}, upsert=True)
    else:
        if collection == "news":
            scrapped_media = feeds_service.news(config.get("news_items").get("functions"))
        elif collection == "videos":
            scrapped_media = feeds_service.videos(config.get("videos_items").get("channels"))
        for item in scrapped_media:
            db.get_collection(collection).update_one({"name": item.get("name")}, {"$setOnInsert": item}, upsert=True)    
    if not thread:
        return jsonify({"refresh":"done"}), 200

@app.route("/api/feeds/media/<collection>/safe", methods=["PUT"])
def safe_media(collection):
    print(request.get_json())
    _id = request.get_json().get("id")
    safe = request.get_json().get("safe")
    query = {"_id": ObjectId(_id)}
    if safe:
        db.get_collection(collection).update_one(query, {"$set": {"saved": True}})
        saved = db.get_collection(collection).find_one(query)
        sb.get_collection(collection).update_one(query, {"$setOnInsert": saved}, upsert=True)
    else:
        db.get_collection(collection).update_one(query, {"$set": {"saved": False}})
        sb.get_collection(collection).delete_one(query)
    return str(safe).lower(), 200

@app.route("/api/feeds/media/<collection>/load")
def get_media(collection):
    return load_media(request.args.get("c", type=int), collection, "db", config.get("media_items").get(collection)[:-1], request.args.getlist(config.get("media_items").get(collection)))

@app.route("/api/feeds/media/<collection>/saved/load")
def get_saved_media(collection):
    return load_media(request.args.get("c", type=int), collection, "sb", config.get("media_items").get(collection)[:-1], request.args.getlist(config.get("media_items").get(collection)))

def load_media(counter, collection, db, filter, filter_list):
    time.sleep(0.1)
    quantity = 5
    if not filter_list:
        if collection == "news":
            filter_list = config.get("news_items").get("sources")
        elif collection == "videos":
            filter_list = config.get("videos_items").get("channels")
        elif collection == "tweets":
            filter_list = config.get("tweets_items").get("hashtags")
    if counter == 0:
        feed = dumps(list(globals()[db].get_collection(collection).find({filter: {"$in": filter_list}}).limit(quantity).sort("date", -1)))
        return feed, 200
    elif counter >= globals()[db].get_collection(collection).count_documents({}):
        return jsonify({"insert":"done"}), 200
    else:
        feed = dumps(list(globals()[db].get_collection(collection).find({filter: {"$in": filter_list}}).skip(counter).limit(quantity).sort("date", -1)))
        return feed, 200

#                            __    
#(\,------------------------'()'--o
# (_    _ VULNERABILITIES _    /~" 
#  (_)_)                  (_)_)    
####################################################################################

@app.route("/api/feeds/vulnerabilities/<collection>/refresh", methods=["GET"])
def add_vulnerabilities(collection, thread=False):
    if collection == "hackerone":
        new_vulnerabilities = feeds_service.hackerone()
    elif collection == "bugcrowd":
        new_vulnerabilities = feeds_service.bugcrowd()
    elif collection == "exploitdb":
        new_vulnerabilities = feeds_service.exploitdb()
    elif collection == "cve":
        new_vulnerabilities = feeds_service.cve()
    for vuln in new_vulnerabilities:
        db.get_collection(collection).update_one({"name": vuln.get("name")}, {"$setOnInsert": vuln}, upsert=True)
    if not thread:
        return jsonify({"refresh":"done"}), 200

@app.route("/api/feeds/vulnerabilities/<collection>", methods=["GET"])
def get_vulnerabilities(collection):
    return dumps(list(db.get_collection(collection).find())), 200

@app.route("/api/feeds/vulnerabilities/<collection>/saved", methods=["PUT", "GET"])
def saved_vulnerabilities(collection):
    if request.method == "PUT":
        return update_vulnerabilities(request.json, collection)
    elif request.method == "GET":
        return dumps(list(sb.get_collection(collection).find())), 200

def update_vulnerabilities(data, collection):
    name_query = {"name": data["name"]}
    if data["action"] == "check":
        to_safe = True
        db.get_collection(collection).update_one(name_query, {"$set": {"saved": to_safe}})
        saved = db.get_collection(collection).find_one(name_query)
        sb.get_collection(collection).update_one(name_query, {"$setOnInsert": saved}, upsert=True)
    else:
        to_safe = False
        db.get_collection(collection).update_one(name_query, {"$set": {"saved": to_safe}})
        sb.get_collection(collection).delete_one(name_query)
    return str(to_safe).lower(), 200

#                  __    
#(\,--------------'()'--o
# (_    _ PAPERS _    /~" 
#  (_)_)          (_)_)    
####################################################################################

@app.route("/api/feeds/papers/<collection>/refresh", methods=["GET"])
def add_papers(collection, thread=False):
    if collection == "exploitdbsp":
        new_papers = feeds_service.exploitdbsp()
    elif collection == "nist":
        new_papers = feeds_service.nist()
    elif collection == "oxford":
        new_papers = feeds_service.oxford()
    for paper in new_papers:
        db.get_collection(collection).update_one({"name": paper.get("name")}, {"$setOnInsert": paper}, upsert=True)
    if not thread:
        return jsonify({"refresh":"done"}), 200

@app.route("/api/feeds/papers/<collection>", methods=["GET"])
def get_papers(collection):
    return dumps(list(db.get_collection(collection).find())), 200

@app.route("/api/feeds/papers/<collection>/saved", methods=["PUT", "GET"])
def saved_papers(collection):
    if request.method == "PUT":
        return update_papers(request.json, collection)
    elif request.method == "GET":
        return dumps(list(sb.get_collection(collection).find())), 200

def update_papers(data, collection):
    name_query = {"name": data["name"]}
    if data["action"] == "check":
        to_safe = True
        db.get_collection(collection).update_one(name_query, {"$set": {"saved": to_safe}})
        saved = db.get_collection(collection).find_one(name_query)
        sb.get_collection(collection).update_one(name_query, {"$setOnInsert": saved}, upsert=True)
    else:
        to_safe = False
        db.get_collection(collection).update_one(name_query, {"$set": {"saved": to_safe}})
        sb.get_collection(collection).delete_one(name_query)
    return str(to_safe).lower(), 200

#                   __    
#(\,---------------'()'--o
# (_    _ SEARCH _    /~" 
#  (_)_)          (_)_)    
####################################################################################

@app.route("/api/search", methods=["POST"])
def search():
    word = request.get_json().get("search")
    items = {
        "news": get_finded_x("news", word),
        "videos": get_finded_x("videos", word),
        "tweets": get_finded_x("tweets", word),
        "hackerone": get_finded_x("hackerone", word),
        "bugcrowd": get_finded_x("bugcrowd", word),
        "exploitdb": get_finded_x("exploitdb", word),
        "cve": get_finded_x("cve", word),
        "exploitdbsp": get_finded_x("exploitdbsp", word),
        "nist": get_finded_x("nist", word),
        "oxford": get_finded_x("oxford", word)
    }
    return dumps(items)

def get_finded_x(collection, word):
    primary = config.get("search_items").get(collection).get("primary")
    secondary = config.get("search_items").get(collection).get("secondary")
    regex = {"$regex": word, "$options": "i"}
    finded_db = list(db.get_collection(collection).find({
        "$or":[
            {primary: regex},
            {secondary: regex}
        ]
    }))
    finded_sb = list(sb.get_collection(collection).find({
        "$or":[
            {primary: regex},
            {secondary: regex}
        ]
    }))
    finded_items = finded_db + finded_sb
    names = {None}
    finded = []
    for item in finded_items:
        name = item.get(primary)
        if name not in names:
            finded.append(item)
            names.add(name)
    return finded

#                    __    
#(\,----------------'()'--o
# (_    _ METRICS _   /~" 
#  (_)_)          (_)_)    
####################################################################################

@app.route("/api/feeds/metrics/todays", methods=["GET"])
def get_todays():
    query = {"date": {"$gt": datetime.now() - timedelta(days=1)}}
    items = {
        "news": db.news.find(query),
        "videos": db.videos.find(query),
        "tweets": db.tweets.find(query),
        "hackerone": db.hackerone.find(query),
        "bugcrowd": db.bugcrowd.find(query),
        "exploitdb": db.exploitdb.find(query),
        "cve": db.cve.find(query),
        "exploitdbsp": db.exploitdbsp.find(query),
        "nist": db.nist.find(query),
        "oxford": db.oxford.find(query)
    }
    return dumps(items)

@app.route("/api/feeds/metrics/saved", methods=["GET"])
def get_saved():
    items = {
        "news": sb.news.estimated_document_count(),
        "videos": sb.videos.estimated_document_count(),
        "tweets": sb.tweets.estimated_document_count(),
        "hackerone": sb.hackerone.estimated_document_count(),
        "bugcrowd": sb.bugcrowd.estimated_document_count(),
        "exploitdb": sb.exploitdb.estimated_document_count(),
        "cve": sb.cve.estimated_document_count(),
        "exploitdbsp": sb.exploitdbsp.estimated_document_count(),
        "nist": sb.nist.estimated_document_count(),
        "oxford": sb.oxford.estimated_document_count()
    }
    return dumps(items)

#                   __    
#(\,---------------'()'--o
# (_    _ CONFIGS _    /~" 
#  (_)_)          (_)_)    
####################################################################################

@app.route("/api/configs/checkVersion", methods=["GET"])
def checkVersion():
    return jsonify(str(feeds_service.github_version() == config.get("version")))

@app.route("/api/configs/checkInit", methods=["GET", "PUT"])
def checkInit():
    if request.method == "GET":
        return jsonify(config.get("init"))
    else:
        config["init"] = False
        safe_toml()
        init()
        return jsonify(config.get("init"))

@app.route("/api/configs/google", methods=["GET", "PUT"])
def google():
    if request.method == "PUT":
        config["google"] = not config["google"]
        safe_toml()
    return jsonify(config.get("google"))

@app.route("/api/configs/align", methods=["GET", "PUT"])
def align():
    if request.method == "PUT":
        align = config.get("align")
        if align == "text-center":
            config["align"] = "text-start"
        else:
            config["align"] = "text-center"
        safe_toml()
    return jsonify(config.get("align"))

def is_valid_channel(channel):
    return feeds_service.speakrj(channel)

def is_valid_username(username):
    return len(username) > 0 and re.match("^[A-Za-z0-9\s_-]*$", username)

@app.route("/api/configs/channels", methods=["GET", "POST", "PUT", "DELETE"])
def channels():
    if request.method != "GET":
        channel = request.get_json().get("channel")
        username = request.get_json().get("username")
        channels = config.get("videos_items").get("channels")
        usernames = config.get("videos_items").get("usernames")
        if request.method == "POST":
            if channel not in channels and len(channels) != 15 and is_valid_channel(channel):
                if is_valid_username(username):
                    channels.append(channel)
                    usernames.append(username)
                    logging.info("%s added as %s", channel, username)
                else:
                    logging.warning("Invalid username: %s", username)
                    return jsonify({"invalid": "username"})
            else:
                logging.warning("Something failed when trying to add %s", channel)
                return jsonify({"invalid": "channel"})
        if channel not in channels:
            logging.warning("%s is not in %s", channel, channels)
            return jsonify({"invalid": "channel"})
        elif request.method == "PUT":
            old_channel = request.get_json().get("old_channel")
            old_username = request.get_json().get("old_username")
            if is_valid_username(username):
                if old_channel in channels and old_username in usernames:
                    channels[channels.index(old_channel)] = channel
                    usernames[usernames.index(old_username)] = username
                    sb.videos.delete_many({"channel": channel})
                    logging.info("%s with username %s updated to %s with username %s", old_channel, old_username, channel, username)
                else:
                    logging.warning("Something failed when trying to update %s in %s with username as %s in %s", old_channel, channels, old_username, usernames)
            else:
                logging.warning("Invalid username: %s", username)
                return jsonify({"invalid": "username"})
        elif request.method == "DELETE":
            index = channels.index(channel)
            channels.remove(channel)
            usernames.pop(index)
            sb.videos.delete_many({"channel": channel})
            logging.info("%s deleted", channel)
        safe_toml()
    return jsonify(config.get("videos_items"))
    
@app.route("/api/configs/hashtags", methods=["GET", "POST", "PUT", "DELETE"])
def hashtags():
    if request.method != "GET":
        hashtag = request.get_json().get("hashtag")
        match = re.match(r"(^|\B)#(?![0-9_]+\b)([a-zA-Z0-9_]{1,30})(\b|\r)", hashtag)
        if (match == None or " " in hashtag):
            logging.warning("Invalid hashtag: %s", hashtag)
            return jsonify(None)
        hashtag = hashtag[match.start():match.end()]
        hashtags = config.get("tweets_items").get("hashtags")
        if request.method == "POST":
            if hashtag not in hashtags and len(hashtags) != 10:
                hashtags.append(hashtag)
                logging.info("%s added", hashtag)
            else:
                logging.warning("Something failed when trying to add %s", hashtag)
                return jsonify(None)
        if hashtag not in hashtags:
            logging.warning("%s is not in %s", hashtag, hashtags)
            return jsonify(None)
        if request.method == "PUT":
            name = request.get_json().get("name")
            if name not in hashtags:
                hashtags[hashtags.index(name)] = hashtag
                sb.tweets.delete_many({"hashtag": hashtag})
                logging.info("%s updated to %s", name, hashtag)
            else:
                logging.warning("%s is in %s", name, hashtags)
                return jsonify(None)
        elif request.method == "DELETE":
            hashtags.remove(hashtag)
            sb.tweets.delete_many({"hashtag": hashtag})
            logging.info("%s deleted", hashtag)
        safe_toml()
    return jsonify(config.get("tweets_items").get("hashtags"))

@app.route("/api/configs/refreshMedia", methods=["GET", "PUT"])
def configs_refresh_media():
    if request.method == "PUT":
        time = float(request.get_json().get("time"))
        config["refresh_media_time"] = time
        scheduler.reschedule_job("refresh_media", trigger="interval", hours=time)
        safe_toml()
        logging.info("Refresh media time changed to %s", time)
    return jsonify(config.get("refresh_media_time"))

@app.route("/api/configs/refreshTables", methods=["GET", "PUT"])
def configs_refresh_tables():
    if request.method == "PUT":
        time = float(request.get_json().get("time"))
        config["refresh_tables_time"] = time
        scheduler.reschedule_job("refresh_papers", trigger="interval", hours=time)
        scheduler.reschedule_job("refresh_vulnerabilities", trigger="interval", hours=time)
        safe_toml()
        logging.info("Refresh tables time changed to %s", time)
    return jsonify(config.get("refresh_tables_time"))

#                      __    
#(\,------------------'()'--o
# (_    _ FUNCTIONS _    /~" 
#  (_)_)            (_)_)    
####################################################################################

def safe_toml():
    with open("app/services/config.toml", "w") as c:
        toml.dump(config, c)
        c.close()

@app.route("/service-worker.js")
def sw():
    return make_response(send_from_directory("static/assets", filename="service-worker.js"))

@app.route("/api/deleteAll")
def refresh_database():
    try:
        logging.info("Refreshing databases")
        db.news.drop()
        sb.news.drop()
        db.create_collection("news", capped=True, size=250000, max=250)
        db.videos.drop()
        sb.videos.drop()
        db.create_collection("videos", capped=True, size=250000, max=250)
        db.tweets.drop()
        sb.tweets.drop()
        db.create_collection("tweets", capped=True, size=750000, max=750)
        db.hackerone.drop()
        sb.hackerone.drop()
        db.create_collection("hackerone", capped=True, size=250000, max=250)
        db.bugcrowd.drop()
        sb.bugcrowd.drop()
        db.create_collection("bugcrowd", capped=True, size=250000, max=250)
        db.exploitdb.drop()
        sb.exploitdb.drop()
        db.create_collection("exploitdb", capped=True, size=250000, max=250)
        db.cve.drop()
        sb.cve.drop()
        db.create_collection("cve", capped=True, size=250000, max=250)
        db.exploitdbsp.drop()
        sb.exploitdbsp.drop()
        db.create_collection("exploitdbsp", capped=True, size=250000, max=250)
        db.nist.drop()
        sb.nist.drop()
        db.create_collection("nist", capped=True, size=250000, max=250)
        db.oxford.drop()
        sb.oxford.drop()
        db.create_collection("oxford", capped=True, size=250000, max=250)
        logging.info("Databases refreshed")
    except:
        logging.info("Something went wrong when trying to refresh databases")
    return redirect("/")

def init():
    refresh_database()
    m = threading.Thread(target=refresh_media, args=())
    v = threading.Thread(target=refresh_vulnerabilities, args=())
    p = threading.Thread(target=refresh_papers, args=())
    m.start()
    v.start()
    p.start()
    p.join()
    v.join()
    m.join()
    logging.info("Enjoy Bugs feed!")

def refresh_media():
    threads = []
    for media in ["news", "videos", "tweets"]:
        t = threading.Thread(target=add_media, args=(media,True,))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    logging.info("Media refreshed")
    
def refresh_vulnerabilities():
    threads = []
    for vuln in ["hackerone", "bugcrowd", "exploitdb", "cve"]:
        t = threading.Thread(target=add_vulnerabilities, args=(vuln,True,))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    logging.info("Vulnerabilities refreshed")
    
def refresh_papers():
    threads = []
    for paper in ["nist", "exploitdbsp", "oxford"]:
        t = threading.Thread(target=add_papers, args=(paper,True,))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    logging.info("Papers refreshed")

scheduler = BackgroundScheduler(misfire_grace_time=30)
scheduler.add_job(func=refresh_media, trigger="interval", hours=config.get("refresh_media_time"), id="refresh_media")
scheduler.add_job(func=refresh_vulnerabilities, trigger="interval", hours=config.get("refresh_tables_time"), id="refresh_vulnerabilities")
scheduler.add_job(func=refresh_papers, trigger="interval", hours=config.get("refresh_tables_time"), id="refresh_papers")
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

#                 __    
#(\,-------------'()'--o
# (_    _ MAIN _    /~" 
#  (_)_)         (_)_)    
####################################################################################

@app.errorhandler(404)
def page_not_found(e):
    return redirect("/")

@app.route("/")
def index():
    response = make_response(render_template("index.html", webs=config.get("news_items").get("sources"), channels=zip(config.get("videos_items").get("channels"), config.get("videos_items").get("usernames")), channels2=zip(config.get("videos_items").get("channels"), config.get("videos_items").get("usernames")), hashtags=config.get("tweets_items").get("hashtags")))
    response.cache_control.max_age = 31536000
    return response

if __name__ == "__main__":
    load_dotenv()
    app.run(host="0.0.0.0", port=int(getenv("PORT")), debug=False)

