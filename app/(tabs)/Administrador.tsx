
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
// import { supabase } from './supabase'; // Import Supabase client

export default function Dashboard() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [options, setOptions] = useState([{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]);

  useEffect(() => {
    fetchQuestions(); // Fetch questions when the component loads
  }, []);

  // // Fetch all questions and options from Supabase
  // const fetchQuestions = async () => {
  //   const { data, error } = await supabase
  //     .from('questions')
  //     .select('id, question, level, options(id, option_text, is_correct)');

  //   if (error) {
  //     console.error('Error fetching questions:', error);
  //   } else {
  //     setQuestions(data);
  //   }
  // };

  // // Create a new question with its options
  // const createQuestion = async () => {
  //   if (!newQuestion || !newLevel) return;

  //   // Insert new question
  //   const { data: questionData, error: questionError } = await supabase
  //     .from('questions')
  //     .insert([{ question: newQuestion, level: parseInt(newLevel) }])
  //     .single();

  //   if (questionError) {
  //     console.error('Error creating question:', questionError);
  //     return;
  //   }

  //   // Insert options for the question
  //   const formattedOptions = options.map((option) => ({
  //     question_id: questionData.id,
  //     option_text: option.text,
  //     is_correct: option.isCorrect ? 1 : 0,
  //   }));

  //   const { data: optionsData, error: optionsError } = await supabase
  //     .from('options')
  //     .insert(formattedOptions);

  //   if (optionsError) {
  //     console.error('Error creating options:', optionsError);
  //   } else {
  //     console.log('Question and options created:', questionData, optionsData);
  //     fetchQuestions(); // Refresh the list of questions
  //   }
  // };

  // // Delete a question
  // const deleteQuestion = async (questionId) => {
  //   const { error: optionsError } = await supabase
  //     .from('options')
  //     .delete()
  //     .eq('question_id', questionId);

  //   if (optionsError) {
  //     console.error('Error deleting options:', optionsError);
  //     return;
  //   }

  //   const { error: questionError } = await supabase
  //     .from('questions')
  //     .delete()
  //     .eq('id', questionId);

  //   if (questionError) {
  //     console.error('Error deleting question:', questionError);
  //   } else {
  //     fetchQuestions(); // Refresh the list after deletion
  //   }
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenida Angie</Text>
      
      {/* Form to create a new question
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nueva Pregunta"
          value={newQuestion}
          onChangeText={setNewQuestion}
        />
        <TextInput
          style={styles.input}
          placeholder="Nivel de la Pregunta"
          value={newLevel}
          onChangeText={setNewLevel}
          keyboardType="numeric"
        />

        {options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Opción ${index + 1}`}
              value={option.text}
              onChangeText={(text) => {
                const newOptions = [...options];
                newOptions[index].text = text;
                setOptions(newOptions);
              }}
            />
            <TouchableOpacity
              onPress={() => {
                const newOptions = [...options];
                newOptions[index].isCorrect = !newOptions[index].isCorrect;
                setOptions(newOptions);
              }}
              style={[
                styles.checkbox,
                option.isCorrect ? styles.checkboxChecked : styles.checkboxUnchecked,
              ]}
            >
              <Text style={styles.checkboxText}>{option.isCorrect ? 'Correcta' : 'Incorrecta'}</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Button title="Crear Pregunta" onPress={createQuestion} />
      </View>

/////List of questions grouped by levels 
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              Nivel {item.level}: {item.question}
            </Text>

  //////Display options 
            {item.options && item.options.map((option) => (
              <Text key={option.id} style={styles.optionText}>
                - {option.option_text} {option.is_correct ? '(Correcta)' : ''}
              </Text>
            ))}

  ////// Delete button
            <Button
              title="Eliminar Pregunta"
              onPress={() => deleteQuestion(item.id)}
              color="red"
            />
          </View>
        )}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    padding: 10,
    marginLeft: 10,
  },
  checkboxChecked: {
    backgroundColor: '#27613C',
  },
  checkboxUnchecked: {
    backgroundColor: '#ccc',
  },
  checkboxText: {
    color: '#fff',
  },
  questionContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10,
  },
});






// // Dashboard.tsx
// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// export default function Dashboard() {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Bienvenida Angie</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
// });