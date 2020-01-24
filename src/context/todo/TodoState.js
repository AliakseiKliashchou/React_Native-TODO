import React, { useReducer, useContext } from 'react';
import { Alert } from 'react-native';
import { TodoContext } from './todoContext';
import { todoReducer } from './todoReducer';
import { ScreenContext } from '../screen/screenContext';
import { 
  ADD_TODO, 
  REMOVE_TODO, 
  UPDATE_TODO, 
  SHOW_LOADER, 
  HIDE_LOADER, 
  SHOW_ERROR,
  CLEAR_ERROR,
  FETCH_TODOS
} from '../types';
import { Http } from '../../http';


export const TodoState = ({ children }) => {
  const initialState = {
    todos: [],
    loading: false,
    error: null
  };
  const { changeScreen } = useContext(ScreenContext);
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const addTodo = async title => {
    clearError();
    try {
      const data = await Http.post('https://rn-todo-app-4dfe1.firebaseio.com/todos.json', { title });
      dispatch({ type: ADD_TODO, title, id: data.name });
    } catch (err) {
      showError('Something went wrong...');
    }
  };

  const removeTodo = id => {
    const todo = state.todos.find(t => t.id === id)
    Alert.alert(
      'Item deleting',
      `Are you sure you wanna delete "${todo.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            changeScreen(null);

            await Http.delete(`https://rn-todo-app-4dfe1.firebaseio.com/todos/${id}.json`);

            dispatch({ type: REMOVE_TODO, id });
          }
        }
      ],
      { cancelable: false }
    )
  };

  const fetchTodos = async () => {

    showLoader();
    clearError();

    try {      
      const data = await Http.get('https://rn-todo-app-4dfe1.firebaseio.com/todos.json');
      const todos = Object.keys(data).map( key => ({ ...data[key], id: key }));
      dispatch({ type: FETCH_TODOS, todos });
    } catch (err) {
        showError('Something went wrong. Please, try again later...');
    } finally {
        hideLoader();
    }   

  };

  const updateTodo = async (id, title) => {

    clearError();

    try {
      await Http.patch(`https://rn-todo-app-4dfe1.firebaseio.com/todos/${id}.json`);
      dispatch({ type: UPDATE_TODO, id, title });
    } catch(err) {
      showError('Something went wrong. Please, try again later...');
    } 
    
  };

  const showLoader = () => dispatch({ type: SHOW_LOADER });

  const hideLoader = () => dispatch({ type: HIDE_LOADER });

  const showError = error => dispatch({ type: SHOW_ERROR, error });

  const clearError = () => dispatch({ type: CLEAR_ERROR });

  return (
    <TodoContext.Provider
      value={{
        todos: state.todos,
        loading: state.loading,
        error: state.error,
        addTodo,
        removeTodo,
        updateTodo,
        fetchTodos
      }}
    >
      {children}
    </TodoContext.Provider>
  )
}
