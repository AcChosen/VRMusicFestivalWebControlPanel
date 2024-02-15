# Code by AcChosen. https://github.com/AcChosen

from flask import Blueprint, render_template, request, send_file, redirect
import json
from PIL import Image
import io
from dotenv import load_dotenv
import os
from github import Github
from selenium import webdriver
import time
import threading

views = Blueprint(__name__, "views")

IsWaitingOnGithub = False

# Main Route

@views.route('/')
def hello():
    return redirect("/home", code=302)

####################################################################################################
# Edit. Write new data to "new data" JSON file.

@views.route("/worlddata", methods=['GET', 'POST'])
def worlddata():
    if request.method == 'POST':
        with open("newStringData.json", 'w') as f:
            rawData = request.get_json() #list of dicts...
            data = json.dumps(rawData, indent=2)
            f.write(data)
            f.close()
            Message = {"Message": "Data recieved!"}
        return Message
    return redirect("/world", code=302)

#####################################################################################################
# Submit. Copy the data from the "new data" JSON File to the "current data" JSON file and then reformat and push to github gist.

@views.route("/worlddatasubmit", methods=['GET', 'POST'])
def worlddatasubmit():
    if request.method == 'POST':
        global IsWaitingOnGithub
        IsWaitingOnGithub = True
        with open("currentStringData.json", 'w') as f:
            fd = open("newStringData.json")
            data = fd.read()
            f.write(data)
            PushToGithub(data)
            f.close()
            fd.close()    
            Message = {"Message": "Data Submitted!"}
        return Message
    if request.method == 'GET':
        with open("currentStringData.json") as f:
            try:
                cd = json.load(f)
            except:
                cd = {}
        f.close()
        return cd
    return redirect("/world", code=302)

####################################################################################################
# Reset. Copy the data from the "current data" JSON file to the "new data" JSON File.

@views.route("/worlddatareset", methods=['GET', 'POST'])
def worlddatareset():
    if request.method == 'GET':
        with open("newStringData.json", 'w') as f:
            fd = open("currentStringData.json")
            f.write(fd.read())
            f.close()
            fd.close()
        with open("newStringData.json") as fx:
            try:
                nd = json.load(fx)
            except:
                nd = {}
            fx.close()
            return nd
    return redirect("/world", code=302)

####################################################################################################
# Clear All. Remove all data from the "new data" JSON File.

@views.route("/worlddataclear", methods=['GET', 'POST'])
def worlddataclear():
    if request.method == 'GET':
        with open("newStringData.json", 'w') as f:
            f.write("{}")
            f.close()
        with open("newStringData.json") as fx:
            try:
                nd = json.load(fx)
            except:
                nd = {}
        fx.close()
        return nd
    return redirect("/world", code=302)

####################################################################################################
# Load the world control panel page.

@views.route("/world", methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        with open("paneldata.json") as f:
            try:
                pd = json.load(f)
            except:
                pd = {}
        f.close()
    if request.method == 'POST':
        rawData = request.get_json() #list of dicts...
        data = json.dumps(rawData, indent=2)
        f = open("paneldata.json", "w")
        f.write(data)
        f.close()
        Message = {"Message":"Page Data Updated!"}
        return Message
    with open("currentStringData.json") as f:
        try:
            cd = json.load(f)
        except:
            cd = {}
    f.close()
    with open("newStringData.json") as f:
        try:
            print("Sucessfully loaded New Data file")
            nd = json.load(f)
        except:
            print("Failed to load New Data file")
            nd = {}
    f.close()
    return render_template("index.html", panelData=pd, currentData=cd, newData=nd)

###################################################################################################

@views.route("/checkGithubStatus", methods=['POST'])
def status():
    if request.method == 'POST':
        global IsWaitingOnGithub
        # print("Request Message: " + str(IsWaitingOnGithub))
        Message = {"Message": str(IsWaitingOnGithub)}
        return Message

####################################################################################################
# Load the stream control panel page

# @views.route("/stream", methods=['GET', 'POST'])
# def stream():
#     return render_template("stream.html")

####################################################################################################
#Load the Home Page.

@views.route("/home", methods=['GET', 'POST'])
def home():
    return render_template("home.html")

####################################################################################################
# Load the button template, toast template, and icons

@views.route("/button.html")
def load():
    return render_template("button.html")

@views.route("/toast.html")
def toastload():
    return render_template("toast.html")

@views.route('/saveicon.png')
def image():
    img = Image.open('saveicon.png')
    file_object = io.BytesIO()
    img.save(file_object, 'PNG')
    file_object.seek(0)
    return send_file(file_object, mimetype='image/PNG')

# @views.route('/pinwheel.gif')
# def image2():
#     img = Image.open('pinwheel.gif')
#     file_object = io.BytesIO()
#     img.save(file_object, 'GIF')
#     file_object.seek(0)
#     return send_file(file_object, mimetype='image/gif')

####################################################################################################

#Reformat and post to github gist

def PushToGithub(data):
    global IsWaitingOnGithub
    # print(str(IsWaitingOnGithub))
    load_dotenv('.env')
    # formattedDataList = json.loads(data) # array of dictionaries

    # data = ''
    # for index in range(len(formattedDataList)):
    #     name = ''
    #     v = ''
    #     for key in formattedDataList[index]:
    #         if key == "Name":
    #             name = formattedDataList[index][key]
    #         if key == "Value":
    #             v = formattedDataList[index][key]
    #     data+= str(name) + '=' + str(v) + ' \n'

    # metaTags = "<meta http-equiv='cache-control' content='no-cache'> <meta http-equiv='expires' content='0'> <meta http-equiv='pragma' content='no-cache'>"

    # data = metaTags + data

    repoName = os.environ['REPO_NAME']
    token = os.environ['GITHUB_TOKEN']


    print("Repository Name: " + repoName)
    # print("Github Token: " + token)
 
    
    g = Github(token)
    repo = g.get_user().get_repo(repoName)
    all_files = []
    contents = repo.get_contents("")

    while contents:
        file_content = contents.pop(0)
        if file_content.type == "dir":
            contents.extend(repo.get_contents(file_content.path))
        else:
            file = file_content
            all_files.append(str(file).replace('ContentFile(path="','').replace('")',''))

    # Upload to github
    git_prefix = 'docs/'
    git_file = git_prefix + 'index.html'
    if git_file in all_files:
        contents = repo.get_contents(git_file)
        repo.update_file(contents.path, "committing files", data, contents.sha, branch="main")
        print(git_file + ' UPDATED')
    else:
        repo.create_file(git_file, "committing files", data, branch="main")
        print(git_file + ' CREATED')



    # hasStarted = False
    # while hasStarted == False:
    #     print("Waiting for action to start...")
    #     time.sleep(5)
    #     runs = repo.get_workflow_runs(branch="main", status="in_progress")
    #     if runs.totalCount > 0:
    #         hasStarted = True

    # runs = repo.get_workflow_runs(branch="main", status="in_progress")

    # currentRun = runs[0]
    # runStatus = currentRun.status

    # while runStatus == "in_progress":
    #     print("Waiting for github pages to update...")
    #     time.sleep(5)
    #     currentRun = repo.get_workflow_run(currentRun.id)
    #     runStatus = currentRun.status

    # if runStatus == "success" or runStatus == "completed":
    #     print("Github Pages have been sucessfully updated!")
    # else:
    #     print("Github Pages failed to update!")


    
    new_thread = GithubWaitTask(repo)
    new_thread.start()

    



    #selenium Test
    return


class GithubWaitTask(threading.Thread):

    def __init__ (self, r):
        super(GithubWaitTask, self).__init__()
        self.repo = r

    def run(self):
        hasStarted = False
        while hasStarted == False:
            print("Waiting for action to start...")
            time.sleep(2.5)
            runs = self.repo.get_workflow_runs(branch="main", status="in_progress")
            if runs.totalCount > 0:
                hasStarted = True

        runs = self.repo.get_workflow_runs(branch="main", status="in_progress")

        currentRun = runs[0]
        runStatus = currentRun.status

        while runStatus == "in_progress":
            print("Waiting for github pages to update...")
            time.sleep(2.5)
            currentRun = self.repo.get_workflow_run(currentRun.id)
            runStatus = currentRun.status

        if runStatus == "success" or runStatus == "completed":
            print("Github Pages have been sucessfully updated!")
        else:
            print("Github Pages failed to update!")
        global IsWaitingOnGithub
        IsWaitingOnGithub = False
        # print(str(IsWaitingOnGithub))
        return