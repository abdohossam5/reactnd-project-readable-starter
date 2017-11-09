import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types'
import * as ActionTypes from '../actions';
import ReactModal from 'react-modal';
import ReactLoading from 'react-loading';
import {getReadableDate} from "../utils/Helpers";

class Post extends Component{

  state = {
    isConfirmationModalOpen: false,
    isDeletingPost: false,
  };


  componentDidMount(){
    if(this.props.isFetching) this.props.fetchPostById(this.props.postId)
  };

  componentDidUpdate(){
    if(this.state.isDeletingPost){
      this.closeConfirmationModal(()=>{
        if('onDeletePost' in this.props) this.props.onDeletePost()
      });

    }
  }

  showConfirmationModal = () =>{
    this.setState({
      isConfirmationModalOpen:true
    })
  };

  deletePost(){
    this.setState({
      isDeletingPost: true
    });
    this.props.deletePost(this.props.post.id)
  }

  closeConfirmationModal(cb){
    this.setState({
      isConfirmationModalOpen:false,
      isDeletingPost: false
    }, cb)
  }

  render(){
    const {post, viewMode, vote, isFetching} = this.props;
    const {isConfirmationModalOpen, isDeletingPost } = this.state;

    return(
      <div>

        {!isFetching && (
          <div>
            <Link style={{
              textDecoration: viewMode === 'overview' ? 'underline' :'none',
            }} to={`/${post.category}/${post.id}`}>{post.title}</Link>
            <button disabled={post.isVoting} onClick={() =>  vote(post.id,'upVote')}>+</button>
            <button disabled={post.isVoting} onClick={() => vote(post.id,'downVote')}>-</button>
            <button onClick={() => this.showConfirmationModal()}>Delete</button>
            {/*<button onClick={}>Edit</button>*/}
            <p>Author: {post.author} - Date: {getReadableDate(post.timestamp)} - Comments: {post.commentCount} - Score: {post.voteScore}</p>

            {viewMode === 'details' && (
              <div>
                <p>{post.body}</p>
              </div>
            )}
          </div>
        )}


        {isFetching && <ReactLoading type="spinningBubbles" color='blue'/>}

        <ReactModal
          style={{
            content:{
              maxHeight: '100px',
              maxWidth: '50%',
              top: '25%',
              right: '25%',
              left: '25%'
            }
          }}
          isOpen = {isConfirmationModalOpen}
          contentLabel="Confirmation"
          onRequestClose={() => this.closeConfirmationModal()}
          shouldCloseOnOverlayClick={false}
        >
          {!isDeletingPost && (
            <div>
              <p>Are you sure you want to delete this post?. This action can not be undone.</p>
              <button onClick={() => this.closeConfirmationModal()}>CANCEL</button>
              <button onClick={() => this.deletePost()}>Confirm</button>
            </div>
          )}

          {isDeletingPost && (
            <ReactLoading type="spinningBubbles" color='blue'/>
          )}

        </ReactModal>


      </div>

    )
  }
}

Post.propTypes = {
  postId: PropTypes.string.isRequired,
  viewMode: PropTypes.string.isRequired,
  vote: PropTypes.func.isRequired,
  deletePost: PropTypes.func.isRequired,
  fetchPostById: PropTypes.func.isRequired,
  onDeletePost: PropTypes.func
};

const mapStateToProps = ({entities}, {postId}) => {
  const post = {...entities.posts.byId[postId]};
  return {
    post,
    isFetching: !post.hasOwnProperty('id')
  }
};

const mapDispatchToProps = (dispatch) => ({
  vote: (id, option) => dispatch(ActionTypes.vote({id, option, entityType: 'posts'})),
  deletePost: (id) => dispatch(ActionTypes.deleteEntity({id, entityType: 'posts'})),
  fetchPostById: (postId) => dispatch(ActionTypes.fetchPostById(postId))
});

export default connect(mapStateToProps, mapDispatchToProps)(Post);