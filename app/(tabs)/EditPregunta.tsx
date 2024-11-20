import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/database/supabase.js';
import { useNavigation, useRoute } from '@react-navigation/native'; // Importamos useRoute para obtener los parámetros



export default function EditQuestion() {
    const route = useRoute(); // Usamos useRoute para obtener los parámetros
    const { questionId } = route.params;

    const [question, setQuestion] = useState('');
    const [level, setLevel] = useState('');
    const [options, setOptions] = useState([]);

    // Cargar datos iniciales
    useEffect(() => {
        const fetchQuestionData = async () => {
            // Obtener la pregunta
            const { data: questionData, error: questionError } = await supabase
                .from('QuestionsTable')
                .select('question, level')
                .eq('id_question', questionId)
                .single();

            if (questionError) {
                console.error('Error al cargar la pregunta:', questionError.message);
                Alert.alert('Error', 'No se pudo cargar la pregunta.');
                return;
            }

            setQuestion(questionData.question);
            setLevel(String(questionData.level));

            // Obtener las opciones
            const { data: optionsData, error: optionsError } = await supabase
                .from('OptionsTable')
                .select('id_option, option_text, is_correct')
                .eq('fk_id_question', questionId);

            if (optionsError) {
                console.error('Error al cargar las opciones:', optionsError.message);
                Alert.alert('Error', 'No se pudieron cargar las opciones.');
                return;
            }

            setOptions(
                optionsData.map(option => ({
                    id: option.id_option,
                    text: option.option_text,
                    isCorrect: !!option.is_correct, // Convertimos a boolean
                }))
            );
        };

        fetchQuestionData();
    }, [questionId]);

    // Guardar cambios
    const saveChanges = async () => {
        if (!question || !level) {
            Alert.alert('Espacios vacíos', 'La pregunta y el nivel no pueden estar vacíos.');
            return;
        }

        if (options.some(option => !option.text.trim())) {
            Alert.alert('Opciones vacías', 'Todas las opciones deben tener texto.');
            return;
        }

        if (!options.some(option => option.isCorrect)) {
            Alert.alert('Sin opción correcta', 'Debe haber al menos una opción correcta.');
            return;
        }

        // Actualizar la pregunta
        const { error: questionError } = await supabase
            .from('QuestionsTable')
            .update({ question, level: parseInt(level) })
            .eq('id_question', questionId);

        if (questionError) {
            console.error('Error al actualizar la pregunta:', questionError.message);
            Alert.alert('Error', 'No se pudo actualizar la pregunta.');
            return;
        }

        // Actualizar las opciones
        for (let option of options) {
            const { error: optionError } = await supabase
                .from('OptionsTable')
                .update({
                    option_text: option.text,
                    is_correct: option.isCorrect ? 1 : 0,
                })
                .eq('id_option', option.id);

            if (optionError) {
                console.error(`Error al actualizar la opción ${option.id}:`, optionError.message);
                Alert.alert('Error', `No se pudo actualizar la opción ${option.text}.`);
                return;
            }
        }

        Alert.alert('Cambios guardados', 'La pregunta y sus opciones se han actualizado correctamente.');
        
        
        navigation.navigate('Administrador')

    };

    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Pregunta</Text>

            {/* Formulario de edición */}
            <TextInput
                style={styles.input}
                placeholder="Editar Pregunta"
                value={question}
                onChangeText={setQuestion}
            />
            <TextInput
                style={styles.input}
                placeholder="Nivel de la Pregunta"
                value={level}
                onChangeText={setLevel}
                keyboardType="numeric"
            />

            {options.map((option, index) => (
                <View key={option.id} style={styles.optionContainer}>
                    <TextInput
                        style={styles.inputOptions}
                        placeholder={`Opción ${index + 1}`}
                        value={option.text}
                        onChangeText={text => {
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

            <TouchableOpacity
                style={styles.adminButton}
                onPress={saveChanges}
            >
                <Text style={styles.adminButtonText}>Guardar Cambios</Text>
            </TouchableOpacity>


            <TouchableOpacity
                style={styles.adminButton}
                onPress={() => navigation.navigate('Administrador')}
            >
                <Text style={styles.adminButtonText}>Volver a Admin</Text>
            </TouchableOpacity>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    adminButton: {
        backgroundColor: '#1D3D47',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 20,
    },
    adminButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    inputOptions: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkbox: {
        marginLeft: 10,
        padding: 10,
        borderRadius: 5,
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
});