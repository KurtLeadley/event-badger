import React, { useState, useEffect, useCallback } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { RNCamera } from "react-native-camera";
import { useRoute } from "@react-navigation/native";
import { GlobalStyles } from "../constants/styles";
import { addSubEvent } from "../api/fetch";
import ModalMessage from "../components/ui/ModalMessage";
import Button from '../components/ui/Button';

export default function QRScan() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const route = useRoute();
  const subEventParticipant = route.params.subEvent;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await RNCamera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = useCallback(({ type, data }) => {
    setScanned(true);
    const splitData = data.split("-");
    console.log("Getting QR Data");
    const subEvents = splitData[3].split(',');
    const qrDataObject = {
      cId: splitData[0],
      eId: splitData[1],
      pId: splitData[2],
      first: splitData[4],
      last: splitData[5],
      role: splitData[6],
      status: splitData[7],
      contributionStatus: splitData[8],
      subEvents: subEvents
    };
    console.log(qrDataObject);
    setQrData(qrDataObject);
    checkAccessGranted(subEventParticipant, qrDataObject);
  }, [subEventParticipant]);

  const checkAccessGranted = useCallback(async (subEventParticipant, qrDataObject) => {
    console.log("Check Access Granted");
    console.log(qrDataObject.subEvents);
    console.log(subEventParticipant.label);

    if (qrDataObject.subEvents.includes(subEventParticipant.label)) {
      const incompleteStatusCodes = [2, 3, 4, 8];
      if (incompleteStatusCodes.includes(qrDataObject.contributionStatus)) {
        Alert.alert(
          'Incomplete Payment',
          'The participant has not fully paid for the event.',
          [
            {
              text: 'Cancel',
              onPress: () => {
                console.log('Action cancelled');
                setScanned(false);
              },
              style: 'cancel',
            },
            {
              text: 'Okay',
              onPress: async () => {
                console.log('Proceeding with incomplete payment');
                const entityRecord = {
                  entity_id: qrDataObject.cId,
                  Event_Id: qrDataObject.eId,
                  Event_Name_2: subEventParticipant.event_title,
                  Price_Field: subEventParticipant.label,
                  Date: subEventParticipant.date,
                };
                console.log("Entity Record");
                console.log(entityRecord);
                try {
                  const result = await addSubEvent(entityRecord);
                  if (result.error) {
                    setModalMessage(`Participant ${qrDataObject.first} ${qrDataObject.last} has already been recorded`);
                  } else {
                    setModalMessage(`Thank you for attending ${subEventParticipant.label}, ${qrDataObject.first} ${qrDataObject.last}`);
                  }
                } catch (error) {
                  console.error("Error adding subevent:", error);
                  setModalMessage("An error occurred while recording the participant.");
                }
                setModalVisible(true);
              }
            }
          ],
          { cancelable: false }
        );
        return;
      }

      const entityRecord = {
        entity_id: qrDataObject.cId,
        Event_Id: qrDataObject.eId,
        Event_Name_2: subEventParticipant.event_title,
        Price_Field: subEventParticipant.label,
        Date: subEventParticipant.date,
      };
      console.log("Entity Record");
      console.log(entityRecord);
      try {
        const result = await addSubEvent(entityRecord);
        if (result.error) {
          setModalMessage(`Participant ${qrDataObject.first} ${qrDataObject.last} has already been recorded`);
        } else {
          setModalMessage(`Thank you for attending ${subEventParticipant.label}, ${qrDataObject.first} ${qrDataObject.last}`);
        }
      } catch (error) {
        console.error("Error adding subevent:", error);
        setModalMessage("An error occurred while recording the participant.");
      }
    } else {
      console.log("No");
      setModalMessage(`${qrDataObject.first} ${qrDataObject.last} has not registered for ${subEventParticipant.label}.`);
    }
    setModalVisible(true);
  }, [subEventParticipant]);

  const closeModal = () => {
    setModalVisible(false);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <RNCamera
        onBarCodeRead={scanned ? undefined : handleBarCodeScanned}
        captureAudio={false}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <Text style={styles.subEventText}>Scanning for: {subEventParticipant.event_title} - {subEventParticipant.label}</Text>
      </View>
      {scanned && (
        <View style={styles.bottomOverlay}>
          <Button onPress={() => setScanned(false)}>Scan Again</Button>
        </View>
      )}
      <ModalMessage
        visible={modalVisible}
        message={modalMessage}
        onClose={closeModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  overlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  subEventText: {
    fontSize: 18,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
    padding: 20,
    fontSize: 38,
  },
  resultContainer: {
    backgroundColor: GlobalStyles.colors.primary,
    padding: 20,
    margin: 20,
  }
});
