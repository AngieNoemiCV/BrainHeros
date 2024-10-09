
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '@/database/supabase.js'; // Import Supabase client
import { useNavigation } from '@react-navigation/native'; // Importamos el hook para la navegación

export default function Dashboard() {
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [options, setOptions] = useState([{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]);

  useEffect(() => {
    fetchQuestions(); // Fetch questions when the component loads
  }, []);

  // Fetch all questions and options from Supabase
  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('QuestionsTable')
      .select('id_question, question, level, OptionsTable(id_option, option_text, is_correct)');

    if (error) {
      console.error('Error fetching questions:', error);
    } else {
      setQuestions(data);
    }
  };


  // Delete a question
  const deleteQuestion = async (fk_id_question) => {
    const { error: optionsError } = await supabase
      .from('OptionsTable')
      .delete()
      .eq('fk_id_question', fk_id_question);

    if (optionsError) {
      console.error('Error deleting options:', optionsError);
      return;
    }

    const { error: questionError } = await supabase
      .from('QuestionsTable')
      .delete()
      .eq('id', fk_id_question);

    if (questionError) {
      console.error('Error deleting question:', questionError);
    } else {
      fetchQuestions(); // Refresh the list after deletion
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenida Angie</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminAdd')}
      // handleSaveUsername
      >
        <Text style={styles.buttonText}>Agregar Pregunta</Text>
      </TouchableOpacity>



      {/* List of questions grouped by levels */}
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id_question.toString()}
        renderItem={({ item }) => (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              Nivel {item.level}: {item.question}
            </Text>

            {/* Display options */}
            {item.options && item.options.map((option) => (
              <Text key={option.id_option} style={styles.optionText}>
                - {option.option_text} {option.is_correct ? '(Correcta)' : ''}
              </Text>
            ))}

            {/* Delete button */}
            <Button
              title="Eliminar Pregunta"
              onPress={() => deleteQuestion(item.id)}
              color="red"
            />
          </View>
        )}
      />
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
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
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