addEventListener("load", event => {
    findPreLogins();
    signupUser();
    loginUser();
    fetchPosts();
    searchBarConfig();
    //addNewPost();
});

function signupUser(){
    document.querySelector(".signup-form").addEventListener('submit', event => {
        event.preventDefault();
        const signup_out = document.querySelector(".display-message");
        const login_out = document.querySelector(".login-message");
        //console.log(event.target.firstname);
        fetch('/signup', {
                method: "POST",
                url: "/signup",
                headers: {
                    "Content-Type": "application/json"
                },
                body: `{"firstname":"${event.target.firstname.value}", "lastname":"${event.target.lastname.value}", "email":"${event.target.email.value}", "country":"${event.target.country.value}", "password":"${event.target.password.value}"}`
            })
            .then(response => response.json())
            .then(res => {
                console.log(res);
                if(res.code == 1){
                    const login_btn = document.querySelector('.login-btn').children[0];
                    login_btn.click();
                    login_out.innerHTML = "Signup Completed!!";
                    login_out.style.color = "green";
                }
                else if(res.code == 2){
                    const login_btn = document.querySelector('.login-btn').children[0];
                    login_btn.click();
                    login_out.innerHTML = "User already registered. Login to Continue!";
                    login_out.style.color = "green";
                }
                else{
                    signup_out.innerHTML = "Failed to signup";
                    signup_out.style.color = "red";
                }
            })
            .catch(err => {
                signup_out.innerHTML = err;
                signup_out.style.color = "red";
            });
    });
}

function searchBarConfig(){
    const searchBar = document.querySelector(".search-bar");
    searchBar.addEventListener('keyup', event => {
        event.preventDefault();
        console.clear();
        //console.log(event.target.value.length);
        if(event.target.value.length > -1){
            fetch('/find', {
                method: 'POST',
                url: '/find',
                headers: {
                    "Content-Type" : "application/json"
                },
                body: `{"key": "${event.target.value}"}`
            })
            .then(response => {
                return response.json();
            })
            .then(posts => {
                setPosts(posts);
            })
            .catch(err => {
                console.log(err);
            });
        }
    });
}

function fetchPosts(){
    fetch('/posts')
        .then(response => {
            return response.json();
        })
        .then(posts => {
            setPosts(posts);
        })
        .catch(err => {
            console.log(err);
        });
}

function addNewPost(event, option){
    event.preventDefault();
    //alert("add new post");
    if(localStorage.getItem('user')){
        //console.log(localStorage.getItem('user'));
        const user = JSON.parse(localStorage.getItem('user'));
        const email = user.email;
        //console.log(email);
        var title = "";
        var body = "";
        if(option == 0){
            title = document.querySelector(".new-post-title").value;
            body = document.querySelector(".new-post-body").value.toString();
        }
        if(option == 1){
            title = document.querySelector(".new-question-title").value;
            body = document.querySelector(".new-question-body").value.toString();
        }
        body = body.replaceAll('"',"'");
        //console.log(body);
        const output = document.querySelector(".new-post-output");
        if(title.length > 0){
            fetch('/insert', {
                    method: 'POST',
                    url: '/insert',
                    headers: {"Content-Type": "application/json"},
                    body: `{"email": "${email}", "title": "${title}", "body": "${body}"}`
                })
                .then((response) => {
                    return response.json();
                })
                .then(succ => {
                    if(succ){
                        document.querySelector(".new-post-title").value = "";
                        document.querySelector(".new-post-body").value = "";
                        document.querySelector(".new-question-title").value = "";
                        document.querySelector(".new-question-body").value = "";
                        document.querySelector(".new-post-question-close-btn").click();
                        fetchPosts();
                    }
                })
                .catch(err => {
                    output.style.color = "red";
                    output.innerHTML = err.toString();
                }
            );
        }
    }
    else{
        const login_btn = document.querySelector('.login-btn').children[0];
        login_btn.click();
    }
}

function clickOnComment(event){
    const postsContainer = document.querySelector(".posts-container");
    const currentPost = event.target.parentNode.parentNode.parentNode;
    console.log(currentPost);
    Array.from(postsContainer.children).forEach(child => {
        if(child.dataset.id){
            if(child.dataset.id === currentPost.dataset.id){
                child.style.display = "block";
                try{
                    child.children[0].children[0].children[0].style.display = "flex";
                }
                catch(err){
                    fetchComments(child);
                }
            }
            else{
                child.style.display = "none";
                try{
                    child.children[0].children[0].children[0].style.display = "none";
                }
                catch(err){
                    child.innerHTML =  `
                        <label>Comments : </label>
                        <div class="add-comment" style="display: flex;flex-direction:row;align-content: space-around;width: 100%;">
                            <input type="text" style="width: 75%;" placeholder="Add new Comment..." required>
                            <input type="button" style="width: 25%;background-color: teal;color: white;" value="Add Comment" onclick="addNewComment(event)">
                        </div>
                    `;
                }
            }
        }
    });
}

function setPosts(posts){
    const postsContainer = document.querySelector(".posts-container");
    postsContainer.innerHTML = `
        <div class="forum-title bg-GenSub">
            <div class="pull-right forum-desc">
                <samll>Total posts: ${posts.length}</samll>
            </div>
            <h3>Discussion / Questions</h3>
        </div>
    `;
    posts.forEach(post => {
        const id = post._id;
        const username = post.username;
        const title = post.title;
        const body = post.body;
        const timeVar = new Date(post.createdOn)
        //console.log(timeVar.getFullYear());
        const createdOn = timeVar.toLocaleString('en-GB', {hour:'numeric', minute: 'numeric', hour12: 'true', timeZone: 'IST'}).toString() + "\t" + timeVar.getDate() + "/" + (timeVar.getMonth() + 1) + "/" + timeVar.getFullYear();
        const likes = post.likes;
        const comments = post.comments;
        const views = post.views;
        postsContainer.innerHTML += `
            <div class="forum-item a-post active" data-id="${id}">
                <div class="row">
                    <div><i class="fa fa-arrow-left bg-back" style="display:none;" onclick="hideCommentsForPost(event)"></i></div>
                    <div class="col-md-12">
                        <div class="forum-icon">
                            <i class="fa fa-shield"></i>
                        </div>

                        <a href="#" class="forum-item-title" onclick="clickOnComment(event)">${title}</a>
                        <p>Posted By : ${username}</p>
                        <div class="forum-sub-title">
                            ${body}
                            <p class="card-text"><small class="text-muted"><b>posted on:</b> ${createdOn}</small></p>
                        </div>

                    </div>
                    <div class="col-1 forum-info">
                        <span class="views-number">
                            ${views}
                        </span>
                        <div>
                            <small>Views</small>
                        </div>
                    </div>
                    <div class="col-1 forum-info">
                        <span class="views-number">
                            ${likes}
                        </span>
                        <div>
                            <small>Likes</small>
                        </div>
                    </div>
                    <div class="col-1 forum-info">
                        <span class="views-number">
                            ${comments}
                        </span>
                        <div onclick="showCommentsForPost(event)" style="cursor:pointer;">
                            <small>Comments</small>
                        </div>
                    </div>
                </div>
            </div>
            <!--General Disscussion start-->
            <div class="a-post-comments" data-id="${id}" style="display:none;">
                <label>Comments : </label>
                <div class="add-comment" style="display: flex;flex-direction:row;align-content: space-around;width: 100%;">
                    <input type="text" style="width: 75%;" placeholder="Add new Comment..." required>
                    <input type="button" style="width: 25%;background-color: teal;color: white;" value="Add Comment" onclick="addNewComment(event)">
                </div>
            </div>
            <!--General Disscussion end-->
        `;
    });

}

function addNewComment(event){
    const newComment = event.target.parentNode.parentNode.children[0].value;
    if(newComment.length > 0){
        if(localStorage.getItem('user')){
            const id = event.target.parentNode.parentNode.parentNode.parentNode.dataset.id;
            const username = JSON.parse(localStorage.getItem('user')).email;
            fetch('/addNewComment', {
                    method: 'POST',
                    url: '/addNewComment',
                    headers: {
                        "Content-Type" : "application/json"
                    },
                    body: `{"postid": "${id}","body": "${newComment}","username": "${username}"}`
                })
                .then(response => response.json())
                .then(succ => {
                    const comment_count = event.target.parentNode.parentNode.parentNode.parentNode.previousElementSibling.children[0].children[4].children[0];
                    comment_count.innerHTML = parseInt(parseInt(comment_count.innerHTML) + 1);
                    fetchComments(event.target.parentNode.parentNode.parentNode.parentNode);
                })
                .catch(err => {
                    console.log(err);
                });
        }
        else{
            const login_btn = document.querySelector('.login-btn').children[0];
            login_btn.click();
        }
    }
}

function hideCommentsForPost(event){
    const postsContainer = document.querySelector(".posts-container");
    Array.from(postsContainer.children).forEach(child => {
        if(child.dataset.id){
            try{
                child.style.display = "block";
                child.children[0].children[0].children[0].style.display = "none";
            }
            catch(err){
                child.style.display = "none";
            }
        }
    });
}

function showCommentsForPost(event){
    const postsContainer = document.querySelector(".posts-container");
    const currentPost = event.target.parentNode.parentNode.parentNode.parentNode;
    //console.log(currentPost);
    Array.from(postsContainer.children).forEach(child => {
        if(child.dataset.id){
            if(child.dataset.id === currentPost.dataset.id){
                child.style.display = "block";
                try{
                    child.children[0].children[0].children[0].style.display = "flex";
                }
                catch(err){
                    fetchComments(child);
                }
            }
            else{
                child.style.display = "none";
                try{
                    child.children[0].children[0].children[0].style.display = "none";
                }
                catch(err){
                    child.innerHTML =  `
                        <label>Comments : </label>
                        <div class="add-comment" style="display: flex;flex-direction:row;align-content: space-around;width: 100%;">
                            <input type="text" style="width: 75%;" placeholder="Add new Comment..." required>
                            <input type="button" style="width: 25%;background-color: teal;color: white;" value="Add Comment" onclick="addNewComment(event)">
                        </div>
                    `;
                }
            }
        }
    });
}

function fetchComments(child){
    fetch('/getcomments', {
            method: 'POST',
            url: '/getcomments',
            headers: {
                "Content-Type" : "application/json"
            },
            body: `{"postid": "${child.dataset.id}"}`
        })
        .then(response => {
            return response.json();
        })
        .then(comments => {
            //console.log(comments);
            child.innerHTML =  `
                        <label>Comments : </label>
                        <div class="add-comment">
                            <div class="mb-3">
                                <textarea class="form-control comment-body" id="exampleFormControlTextarea1" rows="3" placeholder="Add a comment..."></textarea>
                                <div class="text-end">
                                    <button type="button" class="btn btn-primary rply-btn" onclick="addNewComment(event)">Add Comment</button>
                                </div>
                            </div>
                        </div>
            `;
            //console.log(comments);
            comments.forEach(comment => {
                if(localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).email === comment.username){
                    child.innerHTML += `
                            <div class="topic-box" style="align-text:center;" data-id="${comment._id}" data-postid="${comment.postid}">
                                <h6>
                                    ${comment.body}
                                </h6>
                                <p>Posted by: ${comment.username}</p>
                                <div class="text-center bg-icon">
                                    <i class="fa fa-trash" onclick="bg_delete()"></i>
                                    <label onclick="deleteComment(event)">Delete</label>

                                    <i class="fa fa-reply" onclick="showHideReply(event)"></i>
                                    <label onclick="showHideReply(event)">Reply</label>
    
                                    <a href="https://www.facebook.com" target="_blank" class="fb">
                                        <i class="fa fa-share-alt share" onclick="share()"></i>
                                        <label onclick="share()" class="share">Share</label>
                                    </a>
                                </div>
                                <div class="rply" style="display:none;">
                                    <div class="mb-3">
                                        <label for="exampleFormControlTextarea1" class="form-label">Reply : </label>
                                        <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder="Add new reply..."></textarea>
                                        <div class="text-end">
                                            <button type="button" class="btn btn-primary rply-btn" onclick="addNewReplies(event, '${comment._id}')">Reply</button>
                                        </div>
                                    </div>
                                </div>
    
                            </div>
                    `;
                }
                else{
                    child.innerHTML += `
                            <div class="topic-box" style="align-text:center;" data-id="${comment._id}" data-postid="${comment.postid}">
                                <h6>
                                    ${comment.body}
                                </h6>
                                <p>Posted by: ${comment.username}</p>
                                <div class="text-center bg-icon">
                                    <i class="fa fa-reply" onclick="showHideReply(event)"></i>
                                    <label onclick="showHideReply(event)">Reply</label>
    
                                    <a href="https://www.facebook.com" target="_blank" class="fb">
                                        <i class="fa fa-share-alt share" onclick="share()"></i>
                                        <label onclick="share()" class="share">Share</label>
                                    </a>
                                </div>
                                <div class="rply" style="display:none;">
                                    <div class="mb-3">
                                        <label for="exampleFormControlTextarea1" class="form-label">Reply : </label>
                                        <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder="Add new reply..."></textarea>
                                        <div class="text-end">
                                            <button type="button" class="btn btn-primary rply-btn" onclick="addNewReplies(event, '${comment._id}')">Reply</button>
                                        </div>
                                    </div>
                                </div>
    
                            </div>
                    `;
                }
            });
        })
        .catch(err => {
            throw err;
        }
    );
}

function addNewReplies(event, commentId){
    const replyRef = event.target.parentNode.parentNode.parentNode;
    //console.log(replyRef);
    if(localStorage.getItem('user')){
        const username = JSON.parse(localStorage.getItem('user')).email;
        const replyBody = event.target.parentNode.parentNode.children[1].value;
        fetch('/addReplyToComment', {
                method: "POST",
                url: "/addReplyToComment",
                headers: {
                    "Content-Type": "application/json"
                },
                body: `{"comment_id":"${commentId}","body":"${replyBody}","username":"${username}"}`
            })
            .then(response => response.json())
            .then(res => {
                fetchReplies(replyRef, commentId);
            })
            .catch(err => {
                console.log(err);
            });
    }
    else{
        const login_btn = document.querySelector('.login-btn').children[0];
        login_btn.click();
    }
}

function showHideReply(event){
    const replyRef = event.target.parentNode.nextElementSibling;
    if(replyRef.style.display === "none"){
        replyRef.style.display = "block";
        const commentId = event.target.parentNode.parentNode.dataset.id;
        fetchReplies(replyRef, commentId);        
    }
    else    replyRef.style.display = "none";
}

function fetchReplies(replyRef, commentId){
    fetch('/getReplyToComment', {
        method: "POST",
        url: "/getReplyToComment",
        headers: {
            "Content-Type": "application/json"
        },
        body: `{"comment_id":"${commentId}"}`
    })
    .then(response => response.json())
    .then(res => {
        replyRef.innerHTML = `
            <div class="mb-3">
                <label for="exampleFormControlTextarea1" class="form-label">Reply : </label>
                <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder="Add new reply..."></textarea>
                <div class="text-end">
                    <button type="button" class="btn btn-primary rply-btn" onclick="addNewReplies(event, '${commentId}')">Reply</button>
                </div>
            </div>
        `;
        res.forEach(reply => {
            replyRef.innerHTML += `
                <div class="topic-box" data-id="${reply._id}" data-commentid="${reply.commentid}">
                    <h6>
                        ${reply.body}
                    </h6>
                    <p>Posted by: ${reply.username}</p>
                </div>
            `;
            }
        );
    })
    .catch(err => {
        console.log(err);
    });
}

function deleteComment(event){
    const commentRef = event.target.parentNode.parentNode;
    fetch('/deleteComment', {
            method: "POST",
            url: "/deleteCommment",
            headers: {
                "Content-Type": "application/json"
            },
            body: `{"id":"${commentRef.dataset.id}","postid":"${commentRef.dataset.postid}"}`
        })
        .then(response => response.json())
        .then((doc) => {
            const comment_count = event.target.parentNode.parentNode.parentNode.previousElementSibling.children[0].children[4].children[0];
            comment_count.innerHTML = parseInt(parseInt(comment_count.innerHTML) - 1);
            commentRef.remove();
        })
        .catch(err => {
            console.log(err);
        });
}

function findPreLogins(){
    const data = localStorage.getItem("user");
    if(data){
        const user = JSON.parse(data);
        document.querySelector(".login-btn").style.display = "none";
        document.querySelector(".user-profile").children[0].innerHTML = user.username;
        document.querySelector(".user-btn").children[0].addEventListener('click', event => {
            window.localStorage.removeItem("user");
            window.location.reload();
        })
    }
    else{
        document.querySelector(".user-btn").style.display = "none";
        document.querySelector(".user-profile").style.display = "none";
    }
}

function loginUser(){
    const loginForm = document.querySelector(".login-submit");
    loginForm.addEventListener("click", e => {
        e.preventDefault();
        const email = document.querySelector(".login-email");
        const pass = document.querySelector(".login-pass");
        fetch('/login', {
                method: 'POST',
                url: '/login',
                headers: {
                    "Content-Type" : "application/json"
                },
                body: `{"email": "${email.value}","password": "${pass.value}"}`
            })
            .then(response => {
                return response.json();
            })
            .then(user => {
                if(user.length > 0){
                    window.localStorage.setItem("user", JSON.stringify({
                        'username': `${user[0].firstname} ${user[0].lastname}`,
                        'email': `${user[0].email}`,
                        'password': `${user[0].password}`
                    }));
                    window.location.reload();
                }
                else{
                    const login_output = document.querySelector(".login-message");
                    login_output.innerHTML = "Enter Valid Login Credentials..";
                }
            })
            .catch(error => {
                console.log(error);
            })        
    });
}