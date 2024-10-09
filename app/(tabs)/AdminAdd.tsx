
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

    // Create a new question with its options
    const createQuestion = async () => {
        if (!newQuestion || !newLevel) return;

        // Insert new question
        const { data: questionData, error: questionError } = await supabase
            .from('QuestionsTable')
            .insert([{ question: newQuestion, level: parseInt(newLevel) }])
            .single();

        if (questionError) {
            console.error('Error creating question:', questionError);
            return;
        }

        // Insert options for the question
        const formattedOptions = options.map((option) => ({
            fk_id_question: questionData.id,
            option_text: option.text,
            is_correct: option.isCorrect ? 1 : 0,
        }));

        const { data: optionsData, error: optionsError } = await supabase
            .from('OptionsTable')
            .insert(formattedOptions);

        if (optionsError) {
            console.error('Error creating options:', optionsError);
        } else {
            console.log('Question and options created:', questionData, optionsData);
            fetchQuestions(); // Refresh the list of questions
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
                onPress={() => navigation.navigate('Administrador')}
            // handleSaveUsername
            >
                <Text style={styles.buttonText}>Regresar</Text>
            </TouchableOpacity>

            {/* Form to create a new question */}
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