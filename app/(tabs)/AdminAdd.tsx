
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/database/supabase.js'; // Import Supabase client
import { useNavigation } from '@react-navigation/native'; // Importamos el hook para la navegación

export default function Dashboard() {
    const navigation = useNavigation();
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [newLevel, setNewLevel] = useState('');
    const [options, setOptions] = useState([{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }]);

    // Create a new question with his options
    const createQuestion = async () => {

        // Verificar que pregunta y nivel no esten vacios
        if (!newQuestion || !newLevel) {
            Alert.alert('Espacios vacios');
            return;
        }

        // Verificar que no haya opciones vacías
        for (let i = 0; i < options.length; i++) {
            if (!options[i].text.trim()) {
                Alert.alert(`La opción ${i + 1} está vacía`);
                return;
            }
        }

        // Verificar que haya al menos una opción correcta
        const hasCorrectOption = options.some(option => option.isCorrect);

        if (!hasCorrectOption) {
            Alert.alert('Debe haber al menos una opción correcta');
            return;
        }


        // Insert new question
        const { data: questionData, error: questionError } = await supabase
            .from('QuestionsTable')
            .insert([{ question: newQuestion, level: parseInt(newLevel) }])
            .select();

        if (questionError) {
            console.log('Error creating question:', questionError);
            Alert.alert('Algo salio mal, intentelo de nuevo');
            return;
        }

        // Insert options for the question
        const formattedOptions = options.map((option) => ({
            fk_id_question: questionData[0].id_question,
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