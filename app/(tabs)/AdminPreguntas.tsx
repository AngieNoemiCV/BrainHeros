
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/database/supabase.js'; // Import Supabase client
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Importamos el hook para la navegación

export default function Dashboard() {
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);


  useFocusEffect(
    useCallback(() => {
      fetchQuestions(); // Llamamos a la función para obtener los datos cuando la pantalla está enfocada
    }, []),
  );

  useEffect(() => {
    fetchQuestions(); // Fetch questions when the component loads
  }, []);

  // Fetch all questions and options from Supabase
  const fetchQuestions = async () => {
    // setLoading(false);
    const { data, error } = await supabase
      .from('QuestionsTable')
      .select('id_question, question, level, OptionsTable(id_option, option_text, is_correct)');
    //  setLoading(false);
    if (error) {
      console.error('Error fetching questions:', error);

    } else {
      setQuestions(data);
    //  setLoading(false);
    }
  };

  // Resetear todo el progreso a falso
  // const resetProgress = async () => {
  //   console.error("hi")
  //   const { error } = await supabase
  //     .from('ProgressTable')
  //     .update({ completed: false }); // Actualizamos la columna 'completed' a false para todas las filas
  //     console.error("hi2")

  //   if (error) {
  //     console.error('Error al reiniciar el progreso:', error.message);
  //     Alert.alert('Error', 'No se pudo reiniciar el progreso.');
  //   } else {
  //     Alert.alert('Progreso reiniciado', 'Todos los registros se han actualizado correctamente.');
  //   }
  // };


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
      .eq('id_question', fk_id_question);

    if (questionError) {
      console.error('Error deleting question:', questionError);
    } else {
      fetchQuestions(); // Refresh the list after deletion
      Alert.alert('Eliminado correctamente');
    }
  };



  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Administrador')}
      // handleSaveUsername
      >
        <Text style={styles.buttonText}>Regreesar</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AdminAdd')}
      // handleSaveUsername
      >
        <Text style={styles.buttonText}>Agregar Pregunta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonVolver}
        onPress={() => navigation.navigate('index')}
      // handleSaveUsername
      >
        <Text style={styles.buttonText}>Volver al inicio</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={styles.button}
        onPress={resetProgress}
      >
        <Text style={styles.buttonText}>Reiniciar Progreso</Text>
      </TouchableOpacity> */}



      {/* List of questions grouped by levels */}

      {loading ? (
        <Text style={styles.loading}>Cargando...</Text>
      ) : (
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
                onPress={() => deleteQuestion(item.id_question)}
                color="red"
              />

              <Button
                title="Editar Pregunta"
                onPress={() => navigation.navigate('EditPregunta', { questionId: item.id_question })}
                color="blue"
              />

            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    top: 50,
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
    marginBottom: 10,
  },
  buttonVolver: {
    backgroundColor: '#4A628A',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});