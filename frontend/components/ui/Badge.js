import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getApiConfig } from '../../constants/api';
import { getLogoBase64 } from '../../assets/logos/logos';

const Badge = forwardRef((props, ref) => {
  const api = getApiConfig();
  const qrCodeRef = useRef(null);
  const [logoBase64, setLogoBase64] = useState(null);

  useImperativeHandle(ref, () => ({
    toDataURL: async (callback) => {
      let retries = 3;
      while (retries > 0) {
        if (qrCodeRef.current) {
          try {
            console.log('Calling toDataURL on qrCodeRef.current');
            qrCodeRef.current.toDataURL((data) => {
              if (data) {
                callback(data);
                return;
              } else {
                console.log('QR Code generation failed: Data URL is empty');
              }
            });
          } catch (error) {
            console.log('Error calling toDataURL:', error);
          }
        } else {
          console.log('qrCodeRef.current is not set');
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait and retry
        retries -= 1;
      }
      console.log('Failed to generate QR Code after multiple attempts');
      callback(null);
    }
  }));

  useEffect(() => {
    async function loadLogo() {
      try {
        const base64 = await getLogoBase64(api.logo);
        setLogoBase64(base64);
      } catch (error) {
        console.log('Error loading logo:', error);
      }
    }
    loadLogo();
  }, [api.logo]);

  useEffect(() => {
    if (qrCodeRef.current) {
      console.log('QRCode ref is set');
      props.onQrCodeRendered && props.onQrCodeRendered();
    } else {
      console.log('QRCode ref is not set yet');
    }
  }, [qrCodeRef.current]);

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{props.first_name} {props.last_name}</Text>
      <View style={styles.qrCode}>
        <QRCode
          value={`${props.id}-${props.eId}-${props.participant_id}-${props.subEvents}-${props.first_name}-${props.last_name}-${props.role}-${props.status}-${props.contributionStatus}`}
          size={100}
          color="black"
          backgroundColor="white"
          getRef={qrCodeRef}
        />
      </View>
      {logoBase64 && (
        <Image
          style={styles.image}
          source={{ uri: logoBase64 }}
        />
      )}
    </View>
  );
});

export default Badge;

const styles = StyleSheet.create({
  badge: {
    marginTop: 24,
    alignSelf: 'center',
    height: 243,
    width: 153,
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 14,
    alignSelf: 'center',
  },
  qrCode: {
    alignSelf: 'center',
    marginVertical: 16,
  },
  image: {
    width: '100%',
    height: 50,
    resizeMode: 'contain',
  },
});
