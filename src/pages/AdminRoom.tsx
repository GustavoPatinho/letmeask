import { useHistory, useParams }from 'react-router-dom'

import logoImg from '../assets/images/logo.svg'
import checkImg from '../assets/images/check.svg'
import answerImg from '../assets/images/answer.svg'
import deleteImg  from '../assets/images/delete.svg'
import Disabled  from '../assets/images/Disabled.svg'
import confirmDeleteImg from '../assets/images/confirmDelete.svg'

import { Button } from '../components/Button'
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';

import '../styles/room.scss';
import '../styles/question.scss';
import '../styles/modal.scss'
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';
import { Modal } from '../components/Modal'
import { useState } from 'react'


//import { useAuth } from '../hooks/useAuth';

type RoomParams = {
  id: string;
}


export function AdminRoom () {
  //const { user } = useAuth();
  const [showDeleteModal,setShowDeleteModal] = useState<boolean>(false);
  const [showFinishModal,setShowFinishModal] = useState<boolean>(false);
  const params = useParams<RoomParams>();
  const roomId= params.id;
  const {title, questions} = useRoom(roomId)
  const history = useHistory();

  async function handleEndRoom() {
  
    await database.ref (`rooms/${roomId}`).update({ 
      endedAt: new Date(),
    })
    history.push('/');
  }

  async function handleDeleteQuestion(questionId: string) {
      await database.ref(`rooms/${roomId}/questions/${questionId}`).remove()
    }
  

  async function handleCheckQuestionAsAnswered (questionId: string){
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({ 
      isAnswered: true,
    })
  }

  async function handleHighlightQuestion (questionId: string){
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({ 
      isHighlighted: true,
    })
  }

  return(
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
          <RoomCode code={roomId}/>
          <Button isOutlined onClick={() => setShowFinishModal(true)}>Encerrar Sala</Button>
          {showFinishModal && <Modal
          icon={Disabled}
          title="Encerrar Sala"
          subtitle="Tem certeza que deseja encerrar a sala?"
          onSubmit={() => handleEndRoom()} 
          onClose={()=> setShowFinishModal(false)}/>}
          </div>
        </div>
      </header>
      <main>
        <div className="room-title">

          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

              <div className="question-list">
              {questions.map(question => {
             return (
              <>

               <Question 
               key={question.id}
               content={question.content}
               author={question.author}
               isAnswered={question.isAnswered}
               isHighlighted={question.isHighlighted}
               >
                
                {!question.isAnswered && (
                  <>
                  <button
                  type = "button"
                  onClick={() => handleCheckQuestionAsAnswered(question.id)}>
                  <img src={checkImg} alt="Marcar pergunta como respondida" />
                </button>

                <button
                  type = "button"
                  onClick={() => handleHighlightQuestion(question.id)}>
                  <img src={answerImg} alt="Dar destaque à pergunta" />
                </button>
                </>
                )}
                <button
                  onClick={() => setShowDeleteModal(true)}>
                  <img src={deleteImg} alt="Remover Pergunta" />
                </button>
               </Question>
               
                {showDeleteModal && <Modal
                  icon={confirmDeleteImg}
                  title="Excluir Pergunta"
                  subtitle="Tem certeza que deseja excluir esta pergunta?"
                  onSubmit={() => handleDeleteQuestion(question.id)} 
                  onClose={()=> setShowDeleteModal(false)}/>}
                </>

             );
           })}
              </div>
      </main>
    </div>
  )
}