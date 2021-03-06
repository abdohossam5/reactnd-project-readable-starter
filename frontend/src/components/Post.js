import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import * as ActionTypes from '../actions';
import ReactLoading from 'react-loading';
import {getReadableDate} from "../utils/Helpers";
import { Button, Glyphicon, Modal } from 'react-bootstrap';
import EntityForm from './EntityForm';

class Post extends Component{

  state = {
    isConfirmationModalOpen: false,
    isDeletingPost: false,
    isEditing: false
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

  toggleEditModal(){
    this.setState((prevState) => ({
      isEditing: !prevState.isEditing
    }))
  }

  render(){
    const {post, viewMode, vote, isFetching} = this.props;
    const {isConfirmationModalOpen, isDeletingPost, isEditing } = this.state;

    return(
      <div className="Post-item">

        {!isFetching && (
          <div>

            <div className="Title-cont">

              <div className="Title-text-cont">
                <Link className="fTitle" style={{
                  textDecoration: viewMode === 'overview' ? 'underline' :'none',
                }} to={`/${post.category}/${post.id}`}>{post.title}</Link>
              </div>

              <div className="Action-cont">
                  <Button className="Action-btn" bsStyle="success" disabled={post.isVoting} onClick={() =>  vote(post.id,'upVote')}><Glyphicon glyph="arrow-up" /></Button>
                  <Button className="Action-btn" bsStyle="danger" disabled={post.isVoting} onClick={() => vote(post.id,'downVote')}><Glyphicon glyph="arrow-down" /></Button>
                  <Button className="Action-btn delete" onClick={() => this.showConfirmationModal()}><Glyphicon glyph="trash" /></Button>
                  <Button className="Action-btn" bsStyle="warning" onClick={() => this.toggleEditModal()}><Glyphicon glyph="pencil" /></Button>
              </div>

              <p className="Info-text">Author: {post.author} - Date: {getReadableDate(post.timestamp)} - Comments: {post.commentCount} - Score: {post.voteScore}</p>
            </div>

            {/*<button onClick={}>Edit</button>*/}

            {viewMode === 'details' && (
              <div className="Body-cont">
                <p>{post.body}</p>
              </div>
            )}

            <Modal bsSize="large" aria-labelledby="contained-modal-title-sm"  show={isEditing} onHide={() => this.toggleEditModal()}>
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-lg">EDIT POST</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <EntityForm
                  onComplete={(() => this.toggleEditModal())}
                  action="editPost"
                  id={post.id}/>
              </Modal.Body>
            </Modal>
          </div>
        )}


        {isFetching && <ReactLoading className="Loading-cont" type="spinningBubbles" color='#61DAF9'/>}

        <Modal
          show={isConfirmationModalOpen}
          aria-labelledby="contained-modal-title"
          onHide={() => this.closeConfirmationModal()}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">Confirmation</Modal.Title>
          </Modal.Header>
          {!isDeletingPost && (<Modal.Body style={{
            color: 'white'
          }}>
            Are you sure you want to delete this post?. This action can not be undone.
          </Modal.Body>)}
          {!isDeletingPost && (<Modal.Footer>
            <Button onClick={() => this.closeConfirmationModal()}>Cancel</Button>
            <Button bsStyle="danger" onClick={() => this.deletePost()}>Confirm</Button>
          </Modal.Footer>)}

          {isDeletingPost && (
            <ReactLoading className="Loading-cont" type="spinningBubbles" color='blue'/>
          )}
        </Modal>


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