const express = require("express");
const mongoose = require("mongoose");
const Users = require("./assets/js/models/signup");
const Posts = require("./assets/js/models/post");
const Comments = require("./assets/js/models/comment");
const Replys = require("./assets/js/models/reply");

const app = express();

app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const port = 4500;
const db_name = "forum";
const db_url = "mongodb+srv://himeshnishant1:DUxerrJGMdXIGWgv@cluster0.rrdtzfu.mongodb.net/" + db_name + "?retryWrites=true&w=majority";
const db_params = {
    useNewUrlParser: true,
    useUnifiedTopology: true    
};
mongoose.connect(db_url, db_params)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
    })
    .catch(err => {
        throw err;
    });


app.get("/", (request, response) => {
    response.sendFile(__dirname + "/index.html");
});

app.post("/login", (request, response) => {
    const query = {
        email: {$eq: `${request.body.email}`},
        password: {$eq: `${request.body.password}`}
    };
    Users.find(query)
    .then(res => {
        response.json(res);
    })
    .catch((error) => {
        console.error('Error fetching user:', error);
    });
});

app.post("/signup", (request, response) => {
    const user = new Users({
        firstname: request.body.firstname,
        lastname: request.body.lastname,
        email: request.body.email,
        country: request.body.country,
        password: request.body.password,
    });

    const query = {
        email: {$eq: `${request.body.email}`}
    };
    Users.find(query)
        .then(res => {
            //console.log(res);
            if(res.length == 0){
                user.save()
                    .then(() => {
                        response.json({
                            code: 1
                        });
                    })
                    .catch(err => {
                        response.json({
                            code: -1
                        });
                    });
            }
            else{
                response.json({
                    code: 2
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching user:', error);
        });
    
});

app.get('/posts', (request, response) => {
    Posts.find().sort({createdOn: -1})
        .then(res => {
            response.json(res);
        })
        .catch(err => {
            throw err;
        });
});

app.post('/find', (request, response) => {
    const query = {
        title: {$regex: '.*' + request.body.key + '.*', $options: "i"}
    };
    Posts.find(query).limit(5)
        .then(res => {
            //console.log(res);
            response.json(res);
        })
        .catch(err => {
            throw err;
        });
});

app.post('/insert', (request, response) => {
    //console.log(request.body);
    const post = new Posts({
        username: request.body.email,
        title: request.body.title, 
        body: request.body.body,
        createdOn: Date.now(),
        comments: 0,
        views: 0,
        likes: 0
    });

    post.save()
        .then(() => {
            response.send({
                success: "new post added!!"
            });
        })
        .catch(err => {
            response.sendStatus(err);
        })
});

app.post('/getcomments', (request, response) => {
    const query = {
        postid: request.body.postid
    };
    //console.log(request.body.postid);
    Comments.find(query).sort({createdOn: -1})
            .then(res => {
                response.json(res);
            })
            .catch(err => {
                console.log(err);
            });
});

app.post('/addNewComment', (request, response) => {
    const comment = new Comments({
        postid: request.body.postid,
        body: request.body.body,
        username: request.body.username,
        createdOn: Date.now()
    });

    comment.save()
        .then(() => {
            Posts.findByIdAndUpdate(request.body.postid,{$inc: {comments: 1}})
                .catch(err => {
                    console.log(err);
                });
            response.json({
                success: "Comment Added!!"
            })
        })
        .catch(err => {
            console.log(err);
        });
});

app.post('/updateCommentCounts', (request, response) => {
    //console.log(request.body.postid);
    //console.log(request.body.changeby);
    Posts.findByIdAndUpdate(request.body.postid,{$inc: {comments: request.body.changeby}})
        .catch(err => {
            console.log(err);
        });
});

app.post('/deleteComment', (request, response) => {
    Comments.findByIdAndRemove(request.body.id)
        .then(res => {
            Posts.findByIdAndUpdate(request.body.postid,{$inc: {comments: -1}})
                .catch(err => {
                    console.log(err);
                });
            Replys.deleteMany({commentid: {$eq:  `${request.body.id}`}})
                    .catch(err => {
                        console.log(err);
                    });
            response.json(res);
        })
        .catch(err => {
            console.log(err);
        })
});

app.post('/addReplyToComment', (request, response) => {
    const reply = new Replys({
        commentid: request.body.comment_id,
        body: request.body.body,
        username: request.body.username,
        createdOn: Date.now()
    });

    reply.save()
        .then(res => {
            //console.log(res);
            response.json(res);
        })
        .catch(err => {
            console.log(err);
        });
});

app.post('/getReplyToComment', (request, response) => {
    //console.log(request.body.comment_id);
    const query = {
        commentid: request.body.comment_id
    };
    //console.log(request.body.postid);
    Replys.find(query).sort({createdOn: 1})
            .then(res => {
                //console.log(res);
                response.json(res);
            })
            .catch(err => {
                console.log(err);
            });
});

app.listen(port, err => {
    if(err) throw err;
    else
        console.log("Listening to http://127.0.0.1:" + port);
});